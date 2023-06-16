import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { push, ref, update } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { useList } from "react-firebase-hooks/database";
import { useForm } from "react-hook-form";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Navigate, useOutletContext, useParams } from "react-router-dom";
import { z } from "zod";

import Input from "../../../components/Input";
import { Modal } from "../../../components/Modal";
import SimpleTable from "../../../components/Table/SimpleTable";
import { database } from "../../../config/firebase";
import { Teacher } from "../../timetables/timetable-types";

export default function Teachers() {
  const { timetableUid } = useParams();
  const currentUser: User = useOutletContext();
  const [teachers, loading, error] = useList(
    ref(
      database,
      `users/${currentUser.uid}/timetables/objects/${timetableUid}/teachers`
    )
  );

  const data = useMemo(() => {
    if (!teachers) {
      return [];
    }

    return teachers.map((r) => ({ uid: r.key, ...r.val() }));
  }, [teachers]);

  if (!timetableUid) {
    return <Navigate to="/timetables" />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AiOutlineExclamationCircle />
        <span>Error! {error.toString()}</span>
      </div>
    );
  }

  if (loading || !teachers) {
    return <div>Loading...</div>;
  }

  return (
    <TeachersLoaded
      data={data}
      currentUserId={currentUser.uid}
      timetableId={timetableUid}
    />
  );
}

const schema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2),
  schedule: z.string().length(120),
});

type FormValues = z.infer<typeof schema>;

const columns: ColumnDef<Teacher>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
];

const defaultSchedule =
  "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

type TeachersLoadedProps = {
  data: Teacher[];
  currentUserId: string;
  timetableId: string;
};

function TeachersLoaded({
  data,
  currentUserId,
  timetableId,
}: TeachersLoadedProps) {
  const [defaultValues, setDefaultValues] = useState<FormValues>({
    name: "",
    schedule: defaultSchedule,
  });

  const handleCreate = () => {
    window["form-modal"].showModal();
    setDefaultValues({ name: "", schedule: defaultSchedule });
  };
  const handleEdit = (uid: string) => {
    const foundTeacher = data.find((d) => d.uid === uid);

    if (foundTeacher) {
      window["form-modal"].showModal();
      setDefaultValues({
        uid,
        name: foundTeacher.name,
        schedule: foundTeacher.schedule,
      });
    }
  };
  const handleDelete = (uid: string) => console.log("delete");

  return (
    <>
      <button className="btn btn-primary" onClick={handleCreate}>
        Create new
      </button>
      <Form
        currentUserId={currentUserId}
        defaultValues={defaultValues}
        timetableId={timetableId}
      />
      <SimpleTable
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
  timetableId: string;
};

function Form({ currentUserId, defaultValues, timetableId }: FormProps) {
  const { formState, register, reset, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  console.log("id", timetableId);

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const handleSave = (data: FormValues) => {
    return new Promise<void>((resolve, reject) => {
      if (defaultValues.uid) {
        update(
          ref(
            database,
            `users/${currentUserId}/timetables/objects/${timetableId}/teachers/${defaultValues.uid}`
          ),
          { name: data.name, schedule: data.schedule }
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        push(
          ref(
            database,
            `users/${currentUserId}/timetables/objects/${timetableId}/teachers`
          ),
          {
            name: data.name,
            schedule: data.schedule,
          }
        )
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
      <Input label="Schedule" error={formState.errors["schedule"]}>
        <input
          type="text"
          className="input-bordered input w-full"
          {...register("schedule")}
        />
      </Input>
    </Modal>
  );
}
