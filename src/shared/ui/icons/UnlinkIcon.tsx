export function UnlinkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="9" width="6" height="6" rx="3" />
      <rect x="16" y="9" width="6" height="6" rx="3" />
      <path d="M8 12h2M14 12h2" strokeLinecap="round" />
      <path d="M4 4l16 16" strokeLinecap="round" />
    </svg>
  );
}
