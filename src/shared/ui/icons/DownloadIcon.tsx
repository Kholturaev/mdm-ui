export function DownloadIcon({ size = 16 }: { size?: number }) {
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
        d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
