import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@timetable/components";
import { User, database, databaseOperations } from "@timetable/firebase";
import { Timetable } from "@timetable/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link, useOutletContext } from "react-router-dom";
import { z } from "zod";

import { Modal } from "../../components/Modal";
import SimpleTable from "../../components/Table/SimpleTable";
import { RootState } from "../../store/store";

export default function Timetables() {
  const currentUser: User = useOutletContext();
  const timetablesState = useSelector((state: RootState) => state.timetables);

  if (timetablesState.kind === "timetables-pending") {
    return <div>Loading...</div>;
  }

  return (
    <TimeTablesLoaded
      data={mapTimetables(timetablesState.data)}
      currentUserId={currentUser.uid}
    />
  );
}

function mapTimetables(timetables: Timetable[]): TimetableFlat[] {
  return timetables.map((tt) => ({
    uid: tt.uid,
    name: tt.name,
  }));
}

const schema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

type TimetableFlat = {
  uid: string;
  name: string;
};

type TimetablesLoadedProps = {
  data: TimetableFlat[];
  currentUserId: string;
};

const columns: ColumnDef<TimetableFlat>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
];

function TimeTablesLoaded({ data, currentUserId }: TimetablesLoadedProps) {
  const [defaultValues, setDefaultValues] = useState<FormValues>({ name: "" });

  const handleCreate = () => {
    window["form-modal"].showModal();
    setDefaultValues({ name: "" });
  };

  const handleEdit = (uid: string) => {
    const foundTimetable = data.find((d) => d.uid === uid);

    if (foundTimetable) {
      window["form-modal"].showModal();
      setDefaultValues({ name: foundTimetable.name, uid });
    }
  };

  const handleDelete = (uid: string) => {
    const timetableRef = databaseOperations.ref(
      database,
      `users/${currentUserId}/timetables/${uid}`
    );

    databaseOperations.remove(timetableRef);
  };

  return (
    <>
      <Form currentUserId={currentUserId} defaultValues={defaultValues} />
      <SimpleTable
        data={data}
        columns={columns}
        createAction={handleCreate}
        editAction={(uid) => handleEdit(uid)}
        deleteAction={(uid) => handleDelete(uid)}
        openLink={(uid) => (
          <Link className="btn btn-secondary" to={`/timetables/${uid}/rooms`}>
            Open
          </Link>
        )}
      />
    </>
  );
}

type FormProps = {
  currentUserId: string;
  defaultValues: FormValues;
};

function Form({ currentUserId, defaultValues }: FormProps) {
  const { formState, register, reset, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const handleSave = (data: FormValues) => {
    return new Promise<void>((resolve, reject) => {
      if (defaultValues.uid) {
        databaseOperations
          .update(
            databaseOperations.ref(
              database,
              `users/${currentUserId}/timetables/${defaultValues.uid}`
            ),
            { name: data.name }
          )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        databaseOperations
          .push(
            databaseOperations.ref(
              database,
              `users/${currentUserId}/timetables`
            ),
            {
              name: data.name,
            }
          )
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  };

  return (
    <Modal
      title="Timetable"
      save={handleSave}
      reset={reset}
      handleSubmit={handleSubmit}
    >
      <Input label="Name" error={formState.errors["name"]}>
        <input
          type="text"
          className="input-bordered input w-full"
          {...register("name")}
        />
      </Input>
    </Modal>
  );
}
