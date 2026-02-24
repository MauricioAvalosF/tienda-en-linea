import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Helper: compute discount amount for a cart total
function computeDiscount(type: string, value: number, subtotal: number): number {
  if (type === 'PERCENTAGE') return subtotal * (value / 100);
  if (type === 'FIXED') return Math.min(value, subtotal);
  if (type === 'FREE_SHIPPING') return 9.99;
  return 0;
}

// POST /api/stripe/checkout — create Stripe checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  const { couponCode } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, groupId: true },
    });

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // Collect applicable discounts: automatic group discounts + optional coupon
    let bestDiscount: { id: string; name: string; code: string | null; type: string; value: number } | null = null;
    let discountAmount = 0;

    // Auto discounts for user's group (or all groups)
    const now = new Date();
    const autoDiscounts = await prisma.discount.findMany({
      where: {
        code: null,
        isActive: true,
        OR: [{ groupId: null }, { groupId: user?.groupId ?? undefined }],
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      },
    });

    for (const d of autoDiscounts) {
      if (d.minOrderAmount && subtotal < d.minOrderAmount) continue;
      if (d.maxUses !== null && d.usedCount >= d.maxUses) continue;
      const amt = computeDiscount(d.type, d.value, subtotal);
      if (amt > discountAmount) {
        discountAmount = amt;
        bestDiscount = d;
      }
    }

    // Apply coupon if provided (can override auto if better)
    let couponDiscount: typeof bestDiscount | null = null;
    if (couponCode) {
      const coupon = await prisma.discount.findUnique({ where: { code: couponCode } });
      if (
        coupon &&
        coupon.isActive &&
        (!coupon.startsAt || coupon.startsAt <= now) &&
        (!coupon.expiresAt || coupon.expiresAt >= now) &&
        (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
        (!coupon.groupId || coupon.groupId === user?.groupId) &&
        (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)
      ) {
        const amt = computeDiscount(coupon.type, coupon.value, subtotal);
        if (amt > discountAmount) {
          discountAmount = amt;
          couponDiscount = coupon;
          bestDiscount = coupon;
        } else {
          couponDiscount = coupon; // still track it even if smaller
        }
      }
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: item.product.imageUrls.slice(0, 1),
        },
        unit_amount: Math.round(Number(item.product.price) * 100),
      },
      quantity: item.quantity,
    }));

    // Add discount as negative line item
    if (discountAmount > 0 && bestDiscount) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: bestDiscount.type === 'FREE_SHIPPING'
              ? 'Free Shipping'
              : `Discount: ${bestDiscount.name}${bestDiscount.code ? ` (${bestDiscount.code})` : ''}`,
          },
          unit_amount: -Math.round(discountAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        userId: req.user!.id,
        cartId: cart.id,
        discountId: bestDiscount?.id ?? '',
        discountCode: bestDiscount?.code ?? '',
        discountAmount: discountAmount.toFixed(2),
      },
      customer_email: req.user!.email,
    });

    return res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Checkout error' });
  }
});

// POST /api/stripe/webhook — Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return res.status(400).json({ error: 'Webhook signature invalid' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const cartId = session.metadata?.cartId;
    const discountId = session.metadata?.discountId;
    const discountCode = session.metadata?.discountCode;
    const discountAmount = parseFloat(session.metadata?.discountAmount ?? '0');

    if (userId && cartId) {
      try {
        const cart = await prisma.cart.findUnique({
          where: { id: cartId },
          include: { items: { include: { product: true } } },
        });

        if (cart) {
          const subtotal = cart.items.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0
          );
          const total = Math.max(0, subtotal - discountAmount);

          const order = await prisma.order.create({
            data: {
              userId,
              subtotal,
              total,
              discountCode: discountCode || null,
              discountAmount: discountAmount > 0 ? discountAmount : null,
              status: 'PAID',
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent as string,
              items: {
                create: cart.items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.product.price,
                  total: Number(item.product.price) * item.quantity,
                })),
              },
            },
          });

          await Promise.all(
            cart.items.map((item) =>
              prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
              })
            )
          );

          // Increment discount usedCount
          if (discountId) {
            await prisma.discount.update({
              where: { id: discountId },
              data: { usedCount: { increment: 1 } },
            });
          }

          await prisma.cartItem.deleteMany({ where: { cartId } });
          console.log(`Order ${order.id} created for user ${userId}`);
        }
      } catch (err) {
        console.error('Webhook processing error:', err);
      }
    }
  }

  return res.json({ received: true });
});

// POST /api/stripe/test-checkout — create order directly, no Stripe (dev/test only)
router.post('/test-checkout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        subtotal,
        shippingCost: shipping,
        tax,
        total,
        status: 'PAID',
        stripeSessionId: `test_${Date.now()}`,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
            total: Number(item.product.price) * item.quantity,
          })),
        },
      },
    });

    // Decrement stock
    await Promise.all(
      cart.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    console.log(`[TEST] Order ${order.id} created for user ${req.user!.id}`);
    return res.json({ orderId: order.id, redirectUrl: '/checkout/success' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Test checkout error' });
  }
});

export default router;
