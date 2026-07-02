export function AlertTriangleIcon({ size = 14 }: { size?: number }) {
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
        d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9v4" strokeLinecap="round" />
      <path d="M12 16.5v.01" strokeLinecap="round" />
    </svg>
  );
}
