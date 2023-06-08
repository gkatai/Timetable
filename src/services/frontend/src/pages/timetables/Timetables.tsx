import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useOutletContext } from "react-router-dom";

import SimpleTable from "../../components/Table/SimpleTable";
import { Timetable } from "./timetable-types";

export default function Timetables() {
  const currentUser: User = useOutletContext();
  // const userRef = database.ref("users/" + auth.currentUser.uid);

  console.log("user111:", currentUser);

  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ["timetables"],
    queryFn: getTimetables,
  });

  if (error) {
    return (
      <div className="alert alert-error">
        <AiOutlineExclamationCircle />
        <span>Error! {error.toString()}</span>
      </div>
    );
  }

  if (isLoading || isFetching || !data) {
    return <div>Loading...</div>;
  }

  return <TimeTablesLoaded data={data} />;
}

type TimetablesLoadedProps = {
  data: Timetable[];
};

const columns: ColumnDef<Timetable>[] = [
  {
    accessorKey: "uid",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "name",
    footer: (props) => props.column.id,
  },
];

function TimeTablesLoaded({ data }: TimetablesLoadedProps) {
  return <SimpleTable title="Timetables" data={data} columns={columns} />;
}

function getTimetables() {
  return new Promise<Timetable[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          uid: "2342342",
          name: "Timetable - 1",
        },
        {
          uid: "2342342",
          name: "Timetable - 2",
        },
        {
          uid: "2342342",
          name: "Timetable - 3",
        },
      ]);
    }, 3000);
  });
}
