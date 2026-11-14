import type { ReactNode } from "react";

export type TableColumn<T> = {
  /** Identificador único de la columna. */
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Descripción de la tabla para lectores de pantalla. */
  caption?: string;
  emptyMessage?: string;
  isLoading?: boolean;
};

/** Tabla genérica: cada columna decide cómo pintar su celda con `render`. */
export function Table<T>({
  columns,
  rows,
  getRowKey,
  caption,
  emptyMessage = "No hay datos para mostrar.",
  isLoading = false,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table className="table" aria-busy={isLoading || undefined}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="text-center">
                <span className="loading loading-spinner" aria-label="Cargando" />
              </td>
            </tr>
          )}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center text-base-content/70">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading &&
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
