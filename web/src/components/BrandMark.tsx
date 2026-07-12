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
      <path d="M3 3h29.5L37 7.5V37H7.5L3 32.5V3Z" fill="var(--accent)" />
      <path
        d="M10.5 27.5v-15h9.25m-9.25 7h7.25"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M29 13h-4.75c-2.1 0-3.25 1.05-3.25 2.65 0 4.1 8 2.15 8 7.2 0 2.85-2 4.65-5.15 4.65H20"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
