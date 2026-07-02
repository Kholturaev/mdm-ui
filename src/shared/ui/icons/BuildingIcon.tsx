export function BuildingIcon({ size = 18 }: { size?: number }) {
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
        d="M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M4 21h16M14 21v-5h5a1 1 0 0 1 1 1v4M8 7h2M8 11h2M8 15h2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
