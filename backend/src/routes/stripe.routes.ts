import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// POST /api/stripe/checkout — create Stripe checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: { userId: req.user!.id, cartId: cart.id },
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

    if (userId && cartId) {
      try {
        const cart = await prisma.cart.findUnique({
          where: { id: cartId },
          include: { items: { include: { product: true } } },
        });

        if (cart) {
          const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

          const order = await prisma.order.create({
            data: {
              userId,
              subtotal,
              total: subtotal,
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

export default router;
