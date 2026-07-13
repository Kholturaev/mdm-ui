import { Fragment, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Column, ColumnDef, RowData } from '@tanstack/react-table';
import { cn } from '@shared/lib/cn';
import { LoadingBar } from '../LoadingBar';
import { DatePicker } from '../DatePicker';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

export type ColumnFilterConfig =
  | { type: 'text' }
  | { type: 'date' }
  | { type: 'select'; options: { label: string; value: string }[] }
  | { type: 'custom'; render: () => ReactNode };

/* eslint-disable @typescript-eslint/no-unused-vars -- required to match the augmented ColumnMeta's generic signature */
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Freezes this column to an edge while the rest of the row scrolls past — pair with a `size` on every pinned column so offsets line up. */
    pin?: 'left' | 'right';
    /** Gives this column its own search box in the filter row between the header and the body. */
    filter?: ColumnFilterConfig;
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  /** Column id currently sorted — its cells get a subtle tint so the active sort is visible at a glance. */
  sortedColumnId?: string;
  className?: string;
  /** Lets users drag column borders to resize, and gives every unpinned column a proportional share of the table (based on its declared `size`) instead of auto-fitting the container. Off by default. */
  enableColumnResizing?: boolean;
  /** Current value per column id — pass with `onColumnFiltersChange` to turn on the per-column filter row. */
  columnFilters?: Record<string, string>;
  onColumnFiltersChange?: (filters: Record<string, string>) => void;
  /** Identifies a row for expand/collapse — required alongside `onToggleExpand`/`renderExpandedRow` to turn on the expandable-row toggle in the first column. */
  getRowId?: (row: TData) => string | number;
  /** Row id currently expanded, or `null`/`undefined` when none is. */
  expandedRowId?: string | number | null;
  onToggleExpand?: (row: TData) => void;
  /** Renders a full-width row directly below the toggled row's own `<tr>`. */
  renderExpandedRow?: (row: TData) => ReactNode;
};

function pinnedCellStyle(
  column: Column<unknown, unknown>,
  pinned: 'left' | 'right' | false,
): CSSProperties {
  if (pinned === 'left') return { left: column.getStart('left') };
  if (pinned === 'right') return { right: column.getAfter('right') };
  return {};
}

/** Marks the boundary between a frozen column group and the columns scrolling past it — a token-based border color (visible in both light and dark themes) plus a subtle shadow for depth. */
function pinnedEdgeClass(
  column: Column<unknown, unknown>,
  pinned: 'left' | 'right' | false,
) {
  if (pinned === 'left' && column.getIsLastColumn('left')) {
    return 'border-r-border-strong shadow-[4px_0_6px_-4px_rgba(0,0,0,0.2)]';
  }
  if (pinned === 'right' && column.getIsFirstColumn('right')) {
    return 'border-l border-l-border-strong shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.2)]';
  }
  return '';
}

/** Truncates its content and, only once that content actually overflows, shows the full text in a native tooltip on hover. */
function TruncatedCell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);

  return (
    <span
      ref={ref}
      title={title}
      className="block truncate"
      onMouseEnter={() => {
        const el = ref.current;
        if (!el) return;
        setTitle(
          el.scrollWidth > el.clientWidth
            ? (el.textContent ?? undefined)
            : undefined,
        );
      }}
    >
      {children}
    </span>
  );
}

const FILTER_INPUT_CLASSES =
  'border-border bg-surface text-fg placeholder:text-fg-muted focus:border-primary focus:ring-primary/20 h-7 w-full rounded border px-2 text-xs font-normal outline-none focus:ring-2';

/** Parses a `YYYY-MM-DD` filter value as a local date — avoids the day-off-by-one bug `new Date(string)` has (it parses date-only strings as UTC midnight). */
function parseFilterDate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatFilterDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data',
  onRowClick,
  sortedColumnId,
  className,
  enableColumnResizing = false,
  columnFilters,
  onColumnFiltersChange,
  getRowId,
  expandedRowId,
  onToggleExpand,
  renderExpandedRow,
}: DataTableProps<TData>) {
  const columnPinning = useMemo(() => {
    const left: string[] = [];
    const right: string[] = [];
    for (const column of columns) {
      if (!column.id) continue;
      if (column.meta?.pin === 'left') left.push(column.id);
      if (column.meta?.pin === 'right') right.push(column.id);
    }
    return { left, right };
  }, [columns]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing,
    columnResizeMode: 'onChange',
    state: { columnPinning },
  });
  const rows = table.getRowModel().rows;
  const columnSizing = table.getState().columnSizing;

  // In resize mode, pinned columns and any column the user has manually
  // dragged stay a fixed pixel size; every other column gets a percentage
  // of the table's width proportional to its declared `size`, so extra room
  // on wide screens is shared across all of them instead of piling onto one.
  const cellWidth = (column: Column<unknown, unknown>) => {
    if (!enableColumnResizing) {
      return column.columnDef.size !== undefined ? column.getSize() : undefined;
    }
    const isFixed =
      Boolean(column.columnDef.meta?.pin) ||
      columnSizing[column.id] !== undefined;
    if (isFixed) return column.getSize();
    return `${(column.getSize() / table.getTotalSize()) * 100}%`;
  };

  return (
    <div className={cn('relative h-full overflow-auto', className)}>
      {isLoading && <LoadingBar />}
      <table
        style={
          enableColumnResizing
            ? { minWidth: table.getTotalSize(), width: '100%' }
            : undefined
        }
        className={cn(
          'border-separate border-spacing-0 text-left text-xs transition-[filter,opacity] duration-200',
          enableColumnResizing ? 'table-fixed' : 'w-full',
          isLoading && 'pointer-events-none opacity-60 blur-[1px]',
        )}
      >
        <thead className="bg-surface sticky top-0 z-20">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const column = header.column as Column<unknown, unknown>;
                const pinned = column.getIsPinned();
                const width = cellWidth(column);
                const hasSize = header.column.columnDef.size !== undefined;
                return (
                  <th
                    key={header.id}
                    style={{ width, ...pinnedCellStyle(column, pinned) }}
                    className={cn(
                      'border-border bg-surface relative border-r border-b px-3 py-1 text-xs font-semibold last:border-r-0',
                      sortedColumnId === header.column.id && 'bg-surface-hover',
                      pinned && 'bg-surface-pinned sticky z-10',
                      pinnedEdgeClass(column, pinned),
                      hasSize &&
                        'overflow-hidden text-ellipsis whitespace-nowrap',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {enableColumnResizing && header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          'hover:bg-primary/50 absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize touch-none select-none',
                          header.column.getIsResizing() && 'bg-primary',
                        )}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
          {onColumnFiltersChange && (
            <tr>
              {table.getFlatHeaders().map((header) => {
                const column = header.column as Column<unknown, unknown>;
                const pinned = column.getIsPinned();
                const width = cellWidth(column);
                const filterConfig = header.column.columnDef.meta?.filter;
                const value = columnFilters?.[header.column.id] ?? '';
                const setValue = (next: string) =>
                  onColumnFiltersChange({
                    ...columnFilters,
                    [header.column.id]: next,
                  });
                return (
                  <th
                    key={header.id}
                    style={{ width, ...pinnedCellStyle(column, pinned) }}
                    className={cn(
                      'border-border bg-surface border-r border-b p-1',
                      'last:border-r-0',
                      pinned && 'bg-surface-pinned sticky z-10',
                      pinnedEdgeClass(column, pinned),
                    )}
                  >
                    {!filterConfig ? (
                      <div className="h-7" />
                    ) : filterConfig.type === 'select' ? (
                      <select
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className={cn(FILTER_INPUT_CLASSES, 'appearance-none')}
                      >
                        <option value="">—</option>
                        {filterConfig.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : filterConfig.type === 'custom' ? (
                      filterConfig.render()
                    ) : filterConfig.type === 'date' ? (
                      <DatePicker
                        selected={parseFilterDate(value)}
                        onChange={(date) =>
                          setValue(date ? formatFilterDate(date) : '')
                        }
                        isClearable
                        popperProps={{ strategy: 'fixed' }}
                        wrapperClassName="block"
                        className={FILTER_INPUT_CLASSES}
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className={FILTER_INPUT_CLASSES}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          )}
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
          {rows.map((row) => {
            const rowId = getRowId?.(row.original);
            const canExpand =
              Boolean(renderExpandedRow) &&
              Boolean(onToggleExpand) &&
              rowId !== undefined;
            const isExpanded = canExpand && expandedRowId === rowId;
            const visibleCells = row.getVisibleCells();

            return (
              <Fragment key={row.id}>
                <tr
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    'group hover:bg-surface-hover',
                    isExpanded ? 'bg-surface-hover' : 'bg-surface',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {visibleCells.map((cell, cellIndex) => {
                    const column = cell.column as Column<unknown, unknown>;
                    const pinned = column.getIsPinned();
                    const width = cellWidth(column);
                    const hasSize = cell.column.columnDef.size !== undefined;
                    const content = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    );
                    return (
                      <td
                        key={cell.id}
                        style={{ width, ...pinnedCellStyle(column, pinned) }}
                        className={cn(
                          'border-border text-fg border-r border-b px-3 py-0.5 last:border-r-0',
                          sortedColumnId === cell.column.id &&
                            'bg-surface-hover',
                          pinned && 'sticky z-10',
                          pinned &&
                            (isExpanded
                              ? 'bg-surface-hover'
                              : 'bg-surface-pinned group-hover:bg-surface-hover'),
                          pinnedEdgeClass(column, pinned),
                        )}
                      >
                        {cellIndex === 0 && canExpand ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onToggleExpand?.(row.original);
                              }}
                              aria-label="toggle-row"
                              className={cn(
                                'inline-flex size-5 shrink-0 items-center justify-center rounded border transition-transform',
                                isExpanded
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border text-fg-muted hover:bg-surface-hover hover:text-fg',
                                !isExpanded && '-rotate-90',
                              )}
                            >
                              <ChevronDownIcon size={11} />
                            </button>
                            {hasSize ? (
                              <TruncatedCell>{content}</TruncatedCell>
                            ) : (
                              content
                            )}
                          </div>
                        ) : hasSize ? (
                          <TruncatedCell>{content}</TruncatedCell>
                        ) : (
                          content
                        )}
                      </td>
                    );
                  })}
                </tr>
                {isExpanded && (
                  <tr className="bg-bg">
                    <td
                      colSpan={visibleCells.length}
                      className="border-border border-l-primary/50 border-b border-l-2 px-5 py-4"
                    >
                      {renderExpandedRow?.(row.original)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
