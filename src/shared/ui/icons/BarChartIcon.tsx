export function BarChartIcon({ size = 18 }: { size?: number }) {
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
        d="M4 20V10M12 20V4M20 20v-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
