export function ChecklistIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m3 6 1.5 1.5L7 5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="m3 13 1.5 1.5L7 12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m3 20 1.5 1.5L7 19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 6h10M11 13h10M11 20h10" strokeLinecap="round" />
    </svg>
  );
}
