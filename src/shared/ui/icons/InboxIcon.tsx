export function InboxIcon({ size = 18 }: { size?: number }) {
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
        d="M4 12h4l1.5 2.5h5L16 12h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 5h13a1 1 0 0 1 .98.804l1.5 7.5A1 1 0 0 1 20 14.5v3A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-3a1 1 0 0 1 .02-.196l1.5-7.5A1 1 0 0 1 5.5 5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
