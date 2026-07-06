export function SlidersIcon({ size = 14 }: { size?: number }) {
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
        d="M4 6h6M14 6h6M4 12h11M19 12h1M4 18h2M10 18h10"
        strokeLinecap="round"
      />
      <circle cx="12" cy="6" r="2" />
      <circle cx="17" cy="12" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}
