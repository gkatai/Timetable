import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { child, push, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
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
  const [values, loading, error] = useListVals<TimetableFlat>(
    ref(database, `users/${currentUser.uid}/timetables-flat`)
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

  return <TimeTablesLoaded data={values} currentUserId={currentUser.uid} />;
}

const schema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

type TimetablesLoadedProps = {
  data: TimetableFlat[];
  currentUserId: string;
};

const columns: ColumnDef<TimetableFlat>[] = [
  {
    header: "Name",
    accessorKey: "name",
    footer: (props) => props.column.id,
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
    const timetableFlatRef = ref(
      database,
      `users/${currentUserId}/timetables-flat/${uid}`
    );

    remove(timetableFlatRef);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={handleCreate}>
        Create new
      </button>
      <Form currentUserId={currentUserId} defaultValues={defaultValues} />
      <SimpleTable
        title="Timetables"
        data={data}
        columns={columns}
        editAction={(uid) => handleEdit(uid)}
        deleteAction={(uid) => handleDelete(uid)}
        hasOpen={true}
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
    console.log(defaultValues);
    reset(defaultValues);
  }, [reset, defaultValues]);

  const handleCreateNew = (data: FormValues) => {
    const timetablesFlatRef = ref(
      database,
      `users/${currentUserId}/timetables-flat`
    );
    return new Promise<void>((resolve, reject) => {
      let timetableKey: string | null;
      if (defaultValues.uid) {
        timetableKey = defaultValues.uid;
      } else {
        timetableKey = push(child(timetablesFlatRef, "timetables-flat")).key;
      }

      if (timetableKey) {
        const updates: Record<string, TimetableFlat> = {};
        updates[timetableKey] = {
          uid: timetableKey,
          name: data.name,
          rooms: [],
          teachers: [],
          subjects: [],
          classes: [],
        };
        update(timetablesFlatRef, updates)
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  };

  return (
    <Modal save={handleCreateNew} reset={reset} handleSubmit={handleSubmit}>
      <Input label="Email" error={formState.errors["name"]}>
        <input
          type="text"
          className="input-bordered input w-full"
          {...register("name")}
        />
      </Input>
    </Modal>
  );
}
