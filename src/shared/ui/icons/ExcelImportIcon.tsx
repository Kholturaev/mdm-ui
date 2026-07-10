type IconProps = {
  size?: number;
  className?: string;
};

/** Spreadsheet grid with an upload arrow — signals "bring nomenclature data in from an Excel file". */
export function ExcelImportIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="14" height="11" rx="1.5" />
      <line x1="3" y1="7" x2="17" y2="7" />
      <line x1="3" y1="11" x2="17" y2="11" />
      <line x1="8.5" y1="3" x2="8.5" y2="14" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <polyline points="17 19 20 16 23 19" />
    </svg>
  );
}
