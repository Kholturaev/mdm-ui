export function RulerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <path d="M6 9v2M10 9v3M14 9v2M18 9v3" strokeLinecap="round" />
    </svg>
  );
}
