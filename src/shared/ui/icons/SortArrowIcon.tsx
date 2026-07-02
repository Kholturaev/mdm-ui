type SortArrowIconProps = {
  size?: number;
  className?: string;
};

export function SortArrowUpIcon({ size = 10, className }: SortArrowIconProps) {
  return (
    <svg
      width={size}
      height={size / 2}
      viewBox="0 1 10 5"
      fill="currentColor"
      className={className}
    >
      <path d="M5 1l4 5H1z" />
    </svg>
  );
}

export function SortArrowDownIcon({
  size = 10,
  className,
}: SortArrowIconProps) {
  return (
    <svg
      width={size}
      height={size / 2}
      viewBox="0 4 10 5"
      fill="currentColor"
      className={className}
    >
      <path d="M5 9L1 4h8z" />
    </svg>
  );
}
