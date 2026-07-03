export function ActivityIcon({ size = 18 }: { size?: number }) {
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
        d="M3 12h4l2.5 7L14.5 5l2.5 7H21"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
