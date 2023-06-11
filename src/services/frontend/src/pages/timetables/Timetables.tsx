import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { child, push, ref, update } from "firebase/database";
import { useRef } from "react";
import { useListVals } from "react-firebase-hooks/database";
import { useForm } from "react-hook-form";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useOutletContext } from "react-router-dom";
import { z } from "zod";

import Input from "../../components/Input";
import { Modal } from "../../components/Modal";
import SimpleTable from "../../components/Table/SimpleTable";
import { database } from "../../config/firebase";
import { TimetableFlat } from "./timetable-types";

export default function Timetables() {
  const currentUser: User = useOutletContext();
  const timetablesFlatRef = useRef(
    ref(database, `users/${currentUser.uid}/timetables-flat`)
  );
  const [values, loading, error] = useListVals<TimetableFlat>(
    timetablesFlatRef.current
  );

  if (error) {
    return (
      <div className="alert alert-error">
        <AiOutlineExclamationCircle />
        <span>Error! {error.toString()}</span>
      </div>
    );
  }

  if (loading || !values) {
    return <div>Loading...</div>;
  }

  return <TimeTablesLoaded data={values} uid={currentUser.uid} />;
}

const schema = z.object({
  name: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

type TimetablesLoadedProps = {
  data: TimetableFlat[];
  uid: string;
};

const columns: ColumnDef<TimetableFlat>[] = [
  {
    accessorKey: "uid",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "name",
    footer: (props) => props.column.id,
  },
];

function TimeTablesLoaded({ data, uid }: TimetablesLoadedProps) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const timetablesFlatRef = useRef(
    ref(database, `users/${uid}/timetables-flat`)
  );

  const handleCreateNew = (data: FormValues) => {
    return new Promise<void>((resolve, reject) => {
      const newTimetableKey = push(
        child(timetablesFlatRef.current, "timetables-flat")
      ).key;

      if (newTimetableKey) {
        const updates: Record<string, TimetableFlat> = {};
        updates[newTimetableKey] = {
          uid: newTimetableKey,
          name: data.name,
          rooms: [],
          teachers: [],
          subjects: [],
          classes: [],
        };
        update(timetablesFlatRef.current, updates)
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  };

  return (
    <>
      <button
        className="btn"
        onClick={() => window["create-timetable-modal"].showModal()}
      >
        Create new
      </button>
      <Modal save={handleCreateNew} {...methods}>
        <Input label="Email" error={methods.formState.errors["name"]}>
          <input
            type="text"
            className="input-bordered input w-full"
            {...methods.register("name")}
          />
        </Input>
      </Modal>
      <SimpleTable title="Timetables" data={data} columns={columns} />
    </>
  );
}
