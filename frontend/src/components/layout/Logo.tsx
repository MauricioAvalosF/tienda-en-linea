import Link from 'next/link';

interface Props {
  href?: string;
  className?: string;
}

export default function Logo({ href = '/', className = '' }: Props) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className}`}>
      {/* Store icon */}
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect x="2" y="11" width="22" height="13" rx="1.5" stroke="#d97706" strokeWidth="1.5" />
        <path d="M2 11 L6 4 L20 4 L24 11" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="9" y1="11" x2="9" y2="4" stroke="#d97706" strokeWidth="1" opacity="0.5" />
        <line x1="17" y1="11" x2="17" y2="4" stroke="#d97706" strokeWidth="1" opacity="0.5" />
        <rect x="9.5" y="17" width="7" height="7" rx="0.5" fill="#d97706" fillOpacity="0.2" stroke="#d97706" strokeWidth="1" />
      </svg>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="text-[13px] font-semibold tracking-[0.2em] uppercase text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
          Tienda
        </span>
        <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-amber-600 dark:text-amber-500">
          en línea
        </span>
      </div>
    </Link>
  );
}
