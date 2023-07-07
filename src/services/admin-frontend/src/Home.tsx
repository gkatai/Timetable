import { ColumnDef } from "@tanstack/react-table";
import { SimpleTable } from "@timetable/components";
import { Timetable } from "@timetable/types";
import { Link } from "react-router-dom";

import { useGetTimetables } from "./helpers";

export default function Home() {
  return <Timetables />;
}

type TimetableWithUserId = Timetable & { userId: string };

const columns: ColumnDef<TimetableWithUserId, any>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "UserId",
    accessorKey: "userId",
  },
];

function Timetables() {
  const timetables = useGetTimetables();

  return (
    <div>
      <SimpleTable
        data={timetables}
        columns={columns}
        openLink={(uid) => (
          <Link className="btn btn-secondary" to={`/generate/${uid}`}>
            Open
          </Link>
        )}
      />
    </div>
  );
}
