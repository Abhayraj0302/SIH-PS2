import type { ReactNode } from "react";

export type Column<T> = { key: string; label: string; render: (row: T) => ReactNode };
type Props<T extends { id: number }> = { rows: ReadonlyArray<T>; columns: ReadonlyArray<Column<T>>; selectedId?: number | null; onSelect?: (row: T) => void; label: string };

export default function DataTable<T extends { id: number }>({ rows, columns, selectedId, onSelect, label }: Props<T>) {
  return <div className="table-scroll"><table className="data-table"><caption className="sr-only">{label}</caption><thead><tr>{columns.map((column) => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={selectedId === row.id ? "is-selected" : undefined} aria-selected={selectedId === row.id} tabIndex={onSelect ? 0 : undefined} onClick={() => onSelect?.(row)} onKeyDown={(event) => { if (onSelect && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(row); } }}>{columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}</tr>)}</tbody></table></div>;
}
