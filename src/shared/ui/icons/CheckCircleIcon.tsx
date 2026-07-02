export function CheckCircleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="m8.5 12.5 2.5 2.5 4.5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
