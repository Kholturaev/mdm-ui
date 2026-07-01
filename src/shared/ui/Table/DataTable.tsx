import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { cn } from '@shared/lib/cn';
import { LoadingBar } from '../LoadingBar';

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  /** Column id currently sorted — its cells get a subtle tint so the active sort is visible at a glance. */
  sortedColumnId?: string;
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data',
  onRowClick,
  sortedColumnId,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const rows = table.getRowModel().rows;

  return (
    <div
      className={cn(
        'border-border relative overflow-x-auto rounded-md border',
        className,
      )}
    >
      {isLoading && <LoadingBar />}
      <table
        className={cn(
          'w-full border-collapse text-left text-sm transition-[filter,opacity] duration-200',
          isLoading && 'pointer-events-none opacity-60 blur-[1px]',
        )}
      >
        <thead className="bg-surface">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'border-border border-r border-b px-3 py-2 text-xs font-semibold last:border-r-0',
                    sortedColumnId === header.column.id && 'bg-surface-hover',
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 && !isLoading && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-fg-muted py-10 text-center"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={cn(
                'bg-surface hover:bg-surface-hover',
                onRowClick && 'cursor-pointer',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    'border-border text-fg border-r border-b px-3 py-1.5 last:border-r-0',
                    sortedColumnId === cell.column.id && 'bg-surface-hover',
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
