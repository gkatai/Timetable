import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@timetable/components";
import { database } from "@timetable/firebase";
import { User, databaseOperations } from "@timetable/firebase";
import { Teacher, Timetable } from "@timetable/types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useOutletContext, useParams } from "react-router-dom";
import { z } from "zod";

import { Modal } from "../../../components/Modal";
import SimpleTable from "../../../components/Table/SimpleTable";
import TimetableSelector from "../../../components/TimetableSelector";

export default function Teachers() {
  const { timetableUid } = useParams();
  const {
    currentUser,
    timetable,
  }: { currentUser: User; timetable: Timetable } = useOutletContext();

  if (!timetableUid) {
    return <Navigate to="/timetables" />;
  }

  return (
    <TeachersLoaded
      data={timetable.teachers || []}
      currentUserId={currentUser.uid}
      timetableId={timetableUid}
    />
  );
}

const schema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2),
  schedule: z.string().length(60),
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
  const handleDelete = (uid: string) => {
    const timetableFlatRef = databaseOperations.ref(
      database,
      `users/${currentUserId}/timetables/${timetableId}/teachers/${uid}`
    );

    databaseOperations.remove(timetableFlatRef);
  };

  return (
    <>
      <Form
        currentUserId={currentUserId}
        defaultValues={defaultValues}
        timetableId={timetableId}
      />
      <SimpleTable
        data={data}
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
};

function Form({ currentUserId, defaultValues, timetableId }: FormProps) {
  const { formState, register, reset, handleSubmit, getValues, setValue } =
    useForm<FormValues>({
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
              `users/${currentUserId}/timetables/${timetableId}/teachers/${defaultValues.uid}`
            ),
            { name: data.name, schedule: data.schedule }
          )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        databaseOperations
          .push(
            databaseOperations.ref(
              database,
              `users/${currentUserId}/timetables/${timetableId}/teachers`
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
    <Modal
      title="Teacher"
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
      <TimetableSelector
        defaultTimetableString={getValues("schedule")}
        setTimetableString={(ttString) => setValue("schedule", ttString)}
      />
    </Modal>
  );
}
