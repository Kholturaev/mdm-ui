export function TagIcon({ size = 16 }: { size?: number }) {
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
        d="M12.6 2.6 21 11l-9 9-8.4-8.4a2 2 0 0 1-.6-1.42V4a1.4 1.4 0 0 1 1.4-1.4h6.78a2 2 0 0 1 1.42.6Z"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
