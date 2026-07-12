interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 7h27l4 4v27H11l-4-4V7Z" fill="#0B1825" />
      <path d="M2 2h27l4 4v27H6l-4-4V2Z" fill="var(--accent)" />
      <path
        d="M8.5 25v-15h9.25m-9.25 7h7.25"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M27 10.5h-4.75c-2.1 0-3.25 1.05-3.25 2.65 0 4.1 8 2.15 8 7.2 0 2.85-2 4.65-5.15 4.65H18"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
