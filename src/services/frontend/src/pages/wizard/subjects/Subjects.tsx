import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { push, ref, remove, update } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useOutletContext, useParams } from "react-router-dom";
import Select from "react-select";
import { z } from "zod";

import Input from "../../../components/Input";
import { Modal } from "../../../components/Modal";
import SimpleTable from "../../../components/Table/SimpleTable";
import { database } from "../../../config/firebase";
import {
  Room,
  Subject,
  Timetable,
  subjectSchema,
} from "../../timetables/timetable-types";

type SubjectData = { subjects: Subject[]; rooms: Room[] };

export default function Subjects() {
  const { timetableUid } = useParams();
  const {
    currentUser,
    timetable,
  }: { currentUser: User; timetable: Timetable } = useOutletContext();

  if (!timetableUid) {
    return <Navigate to="/timetables" />;
  }

  return (
    <SubjectsLoaded
      data={{ subjects: timetable.subjects, rooms: timetable.rooms }}
      currentUserId={currentUser.uid}
      timetableId={timetableUid}
    />
  );
}

type FormValues = z.infer<typeof subjectSchema>;

const columns: ColumnDef<Subject>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
  {
    header: "Occupation",
    accessorKey: "occupation",
  },
];

type SubjectsLoadedProps = {
  data: SubjectData;
  currentUserId: string;
  timetableId: string;
};

function SubjectsLoaded({
  data,
  currentUserId,
  timetableId,
}: SubjectsLoadedProps) {
  const [defaultValues, setDefaultValues] = useState<FormValues>({
    name: "",
    occupation: "free",
    rooms: [],
  });

  const handleCreate = () => {
    window["form-modal"].showModal();
    setDefaultValues({ name: "", occupation: "free", rooms: [] });
  };
  const handleEdit = (uid: string) => {
    const foundSubject = data.subjects.find((d) => d.uid === uid);

    if (foundSubject) {
      window["form-modal"].showModal();
      setDefaultValues({
        uid,
        name: foundSubject.name,
        occupation: foundSubject.occupation,
        rooms: foundSubject.rooms,
      });
    }
  };
  const handleDelete = (uid: string) => {
    const timetableFlatRef = ref(
      database,
      `users/${currentUserId}/timetables/${timetableId}/subjects/${uid}`
    );

    remove(timetableFlatRef);
  };

  return (
    <>
      <Form
        currentUserId={currentUserId}
        defaultValues={defaultValues}
        timetableId={timetableId}
        rooms={data.rooms}
      />
      <SimpleTable
        data={data.subjects}
        columns={columns}
        createAction={handleCreate}
        editAction={(uid) => handleEdit(uid)}
        deleteAction={(uid) => handleDelete(uid)}
      />
    </>
  );
}

type FormProps = {
  currentUserId: string;
  defaultValues: FormValues;
  timetableId: string;
  rooms: Room[];
};

function Form({ currentUserId, defaultValues, timetableId, rooms }: FormProps) {
  const { formState, register, reset, handleSubmit, control } =
    useForm<FormValues>({
      resolver: zodResolver(subjectSchema),
    });

  const roomOptions = useMemo(
    () => rooms.map((room) => ({ value: room.uid, label: room.name })),
    [rooms]
  );

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const handleSave = (data: FormValues) => {
    return new Promise<void>((resolve, reject) => {
      if (defaultValues.uid) {
        update(
          ref(
            database,
            `users/${currentUserId}/timetables/${timetableId}/subjects/${defaultValues.uid}`
          ),
          { name: data.name, occupation: data.occupation, rooms: data.rooms }
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        push(
          ref(
            database,
            `users/${currentUserId}/timetables/${timetableId}/subjects`
          ),
          {
            name: data.name,
            occupation: data.occupation,
            rooms: data.rooms,
          }
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  };

  return (
    <Modal
      title="Subject"
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
      <Input label="Occupation" error={formState.errors["occupation"]}>
        <select
          className="select select-bordered w-full"
          {...register("occupation")}
        >
          <option value="free">Free</option>
          <option value="occupied">Occupied</option>
          <option value="registered">Registered</option>
        </select>
      </Input>

      <Input label="Rooms" error={formState.errors["rooms"]}>
        <Controller
          control={control}
          defaultValue={roomOptions.map((c) => c.value)}
          name="rooms"
          render={({ field: { onChange, value, ref } }) => (
            <Select
              value={roomOptions.filter((c) => value.includes(c.value))}
              onChange={(val) => onChange(val.map((c) => c.value))}
              options={roomOptions}
              isMulti
            />
          )}
        />
      </Input>
    </Modal>
  );
}
