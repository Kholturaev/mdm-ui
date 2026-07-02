export function LayersIcon({ size = 18 }: { size?: number }) {
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
        d="M12 3 2 9l10 6 10-6-10-6ZM2 15l10 6 10-6M2 12l10 6 10-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
