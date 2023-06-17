import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { push, ref, remove, update } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { z } from "zod";

import Input from "../../../components/Input";
import { Modal } from "../../../components/Modal";
import SimpleTable from "../../../components/Table/SimpleTable";
import { database } from "../../../config/firebase";
import {
  Class,
  Room,
  Subject,
  Teacher,
  classesSchema,
} from "../../timetables/timetable-types";
import { useGetData } from "./class-helpers";

type ClassData = {
  classes: Class[];
  rooms: Room[];
  teachers: Teacher[];
  subjects: Subject[];
};

export default function Classes() {
  const { timetableUid } = useParams();
  const currentUser: User = useOutletContext();

  const [data, loading, error] = useGetData(currentUser.uid, timetableUid);

  const mappedData = useMemo<ClassData>(() => {
    if (!data.classes || !data.rooms || !data.teachers || !data.subjects) {
      return {
        classes: [],
        rooms: [],
        teachers: [],
        subjects: [],
      };
    }

    return {
      classes: data.classes.map((c) => ({ uid: c.key, ...c.val() })),
      rooms: data.rooms.map((r) => ({ uid: r.key, ...r.val() })),
      teachers: data.teachers.map((t) => ({ uid: t.key, ...t.val() })),
      subjects: data.subjects.map((s) => ({ uid: s.key, ...s.val() })),
    };
  }, [data]);

  if (!timetableUid) {
    return <Navigate to="/timetables" />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AiOutlineExclamationCircle />
        <span>Error! {error}</span>
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(mappedData);

  return (
    <ClassesLoaded
      data={mappedData}
      currentUserId={currentUser.uid}
      timetableId={timetableUid}
    />
  );
}

type FormValues = z.infer<typeof classesSchema>;

const columns: ColumnDef<Class>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
];

type ClassesLoadedProps = {
  data: ClassData;
  currentUserId: string;
  timetableId: string;
};

function ClassesLoaded({
  data,
  currentUserId,
  timetableId,
}: ClassesLoadedProps) {
  const [defaultValues, setDefaultValues] = useState<FormValues>({
    name: "",
    lessons: [],
  });

  const handleCreate = () => {
    window["form-modal"].showModal();
    setDefaultValues({ name: "", lessons: [] });
  };
  const handleEdit = (uid: string) => {
    const foundClass = data.classes.find((d) => d.uid === uid);

    if (foundClass) {
      window["form-modal"].showModal();
      setDefaultValues({
        uid,
        name: foundClass.name,
        lessons: foundClass.lessons,
      });
    }
  };
  const handleDelete = (uid: string) => {
    const timetableFlatRef = ref(
      database,
      `users/${currentUserId}/timetables/objects/${timetableId}/classes/${uid}`
    );

    remove(timetableFlatRef);
  };

  return (
    <>
      <Form
        currentUserId={currentUserId}
        defaultValues={defaultValues}
        timetableId={timetableId}
      />
      <SimpleTable
        data={data.classes}
        columns={columns}
        createAction={handleCreate}
        deleteAction={handleDelete}
        editAction={handleEdit}
        openLink={(uid) => (
          <Link
            className="btn btn-secondary"
            to={`/timetables/${timetableId}/classes/${uid}/lessons`}
          >
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
  timetableId: string;
};

function Form({ currentUserId, defaultValues, timetableId }: FormProps) {
  const { formState, register, reset, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(classesSchema),
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
            `users/${currentUserId}/timetables/objects/${timetableId}/classes/${defaultValues.uid}`
          ),
          { name: data.name, lessons: data.lessons }
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        push(
          ref(
            database,
            `users/${currentUserId}/timetables/objects/${timetableId}/classes`
          ),
          {
            name: data.name,
            lessons: data.lessons,
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
    </Modal>
  );
}
