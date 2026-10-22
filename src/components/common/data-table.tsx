'use client';

import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Hide this column from the mobile card layout. */
  hideOnMobile?: boolean;
  /** Rendered as the title of the mobile card. */
  primary?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  caption?: string;
  isLoading?: boolean;
  skeletonRows?: number;
  empty?: ReactNode;
  /** Dim the table while a previous page is being fetched. */
  dimmed?: boolean;
  className?: string;
}

interface RowProps<T> {
  row: T;
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
}

function TableRowInner<T>({ row, columns, getRowId }: RowProps<T>) {
  return (
    <tr className="border-b border-line/70 transition-colors duration-150 last:border-b-0 hover:bg-surface-2/50">
      {columns.map((column) => (
        <td
          key={column.id}
          className={cn('px-4 py-3 align-middle text-sm text-muted', column.className)}
        >
          {column.render(row)}
        </td>
      ))}
      <td className="sr-only">{getRowId(row)}</td>
    </tr>
  );
}

/** Memoised so a parent re-render never re-renders unchanged rows. */
const TableRow = memo(TableRowInner) as typeof TableRowInner;

function CardRowInner<T>({ row, columns }: Omit<RowProps<T>, 'getRowId'>) {
  const primary = columns.find((column) => column.primary) ?? columns[0];
  const secondary = columns.filter((column) => column !== primary && !column.hideOnMobile);

  return (
    <li className="rounded-2xl border border-line bg-surface-2/40 p-4">
      <div className="text-sm font-medium text-fg">{primary?.render(row)}</div>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {secondary.map((column) => (
          <div key={column.id} className="min-w-0">
            <dt className="text-[11px] uppercase tracking-wide text-subtle">{column.header}</dt>
            <dd className="mt-0.5 truncate text-sm text-muted">{column.render(row)}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}

const CardRow = memo(CardRowInner) as typeof CardRowInner;

/**
 * Responsive table: a real `<table>` on desktop that degrades into a list of
 * cards on small screens.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  isLoading,
  skeletonRows = 6,
  empty,
  dimmed,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={cn('divide-y divide-line', className)}>
        {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-4 py-3.5">
            {columns.map((column, columnIndex) => (
              <Skeleton
                key={column.id}
                className={cn('h-4', columnIndex === 0 ? 'w-44' : 'flex-1')}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={cn('transition-opacity duration-150', dimmed && 'opacity-60', className)}>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-subtle',
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <TableRow
                key={getRowId(row)}
                row={row}
                columns={columns}
                getRowId={getRowId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 p-3 md:hidden">
        {rows.map((row) => (
          <CardRow key={getRowId(row)} row={row} columns={columns} />
        ))}
      </ul>
    </div>
  );
}
