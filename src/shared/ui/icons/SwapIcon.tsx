export function SwapIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M7 7h11l-3-3M17 17H6l3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
