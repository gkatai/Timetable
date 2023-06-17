import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { push, ref, remove, update } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { useList } from "react-firebase-hooks/database";
import { useForm } from "react-hook-form";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Link, useOutletContext } from "react-router-dom";
import { z } from "zod";

import Input from "../../components/Input";
import { Modal } from "../../components/Modal";
import SimpleTable from "../../components/Table/SimpleTable";
import { database } from "../../config/firebase";
import { TimetableFlat } from "./timetable-types";

export default function Timetables() {
  const currentUser: User = useOutletContext();
  const [timetables, loading, error] = useList(
    ref(database, `users/${currentUser.uid}/timetables/list`)
  );
  const data = useMemo(() => {
    if (!timetables) {
      return [];
    } else {
      return timetables.map((t) => ({ uid: t.key, ...t.val() }));
    }
  }, [timetables]);

  if (error) {
    return (
      <div className="alert alert-error">
        <AiOutlineExclamationCircle />
        <span>Error! {error.toString()}</span>
      </div>
    );
  }

  if (loading || !timetables) {
    return <div>Loading...</div>;
  }

  return <TimeTablesLoaded data={data} currentUserId={currentUser.uid} />;
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
        update(
          ref(
            database,
            `users/${currentUserId}/timetables/list/${defaultValues.uid}`
          ),
          { name: data.name }
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        push(ref(database, `users/${currentUserId}/timetables/list`), {
          name: data.name,
        })
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  };

  return (
    <Modal save={handleSave} reset={reset} handleSubmit={handleSubmit}>
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
