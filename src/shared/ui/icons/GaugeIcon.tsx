export function GaugeIcon({ size = 18 }: { size?: number }) {
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
        d="M12 21a9 9 0 1 0-9-9c0 2.11.71 4.06 1.9 5.61"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 12 16 8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}
