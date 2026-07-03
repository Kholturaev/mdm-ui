export function PackageIcon({ size = 18 }: { size?: number }) {
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
        d="M21 8.5v7a1 1 0 0 1-.5.87l-8 4.62a1 1 0 0 1-1 0l-8-4.62A1 1 0 0 1 3 15.5v-7a1 1 0 0 1 .5-.87l8-4.62a1 1 0 0 1 1 0l8 4.62a1 1 0 0 1 .5.87Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m3.27 7.96 8.73 5.04 8.73-5.04M12 22.5v-9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
