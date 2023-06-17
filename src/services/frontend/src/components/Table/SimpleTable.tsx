import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";

type SimpleTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  createAction: () => void;
  editAction: (id: string) => void;
  deleteAction: (id: string) => void;
  openLink: (id: string) => React.ReactElement | null;
};

export default function SimpleTable<T>({
  data,
  columns,
  createAction,
  editAction,
  deleteAction,
  openLink = null,
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
              <th className="float-right">
                <button className="btn btn-primary" onClick={createAction}>
                  Create new
                </button>
              </th>
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
                  {openLink && openLink(row.original["uid"])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
