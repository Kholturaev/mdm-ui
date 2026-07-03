export function BarcodeIcon({ size = 14 }: { size?: number }) {
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
        d="M3 5v14M7 5v14M10 5v14M13 5v14M17 5v14M21 5v14"
        strokeLinecap="round"
      />
    </svg>
  );
}
