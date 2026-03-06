import Link from 'next/link';

interface Props {
  href?: string;
  className?: string;
}

export default function Logo({ href = '/', className = '' }: Props) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      {/* Gem icon */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <polygon
          points="14,2 26,10 22,26 6,26 2,10"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon
          points="14,2 26,10 14,8 2,10"
          fill="#d97706"
          fillOpacity="0.2"
          strokeWidth="0"
        />
        <line x1="2" y1="10" x2="14" y2="8" stroke="#d97706" strokeWidth="1" opacity="0.6" />
        <line x1="26" y1="10" x2="14" y2="8" stroke="#d97706" strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="8" x2="14" y2="26" stroke="#d97706" strokeWidth="1" opacity="0.4" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="text-[13px] font-semibold tracking-[0.22em] uppercase text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          Maison
        </span>
        <span className="text-[9px] font-medium tracking-[0.35em] uppercase text-amber-600 dark:text-amber-500">
          de Parfum
        </span>
      </div>
    </Link>
  );
}
