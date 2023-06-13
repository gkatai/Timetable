import {
  ColumnDef,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";
import { Link } from "react-router-dom";

type SimpleTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  editAction: (id: string) => void;
  deleteAction: (is: string) => void;
  hasOpen?: boolean;
};

export default function SimpleTable<T>({
  data,
  columns,
  editAction,
  deleteAction,
  hasOpen = false,
}: SimpleTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : "",
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <BiUpArrow />,
                          desc: <BiDownArrow />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row: any) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell: any) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
                <td className="flex gap-4 justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => editAction(row.original["uid"])}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={() => deleteAction(row.original["uid"])}
                  >
                    Delete
                  </button>
                  {hasOpen && (
                    <Link
                      className="btn btn-secondary"
                      to={`/timetables/${row.original["uid"]}/rooms`}
                    >
                      Open
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
