import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "firebase/auth";
import { push, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useOutletContext, useParams } from "react-router-dom";
import { z } from "zod";

import Input from "../../../components/Input";
import { Modal } from "../../../components/Modal";
import SimpleTable from "../../../components/Table/SimpleTable";
import TimetableSelector from "../../../components/TimetableSelector";
import { database } from "../../../config/firebase";
import { Room, Timetable } from "../../timetables/timetable-types";

export default function Rooms() {
  const { timetableUid } = useParams();
  const {
    currentUser,
    timetable,
  }: { currentUser: User; timetable: Timetable } = useOutletContext();

  if (!timetableUid) {
    return <Navigate to="/timetables" />;
  }

  return (
    <RoomsLoaded
      data={timetable.rooms || []}
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

const columns: ColumnDef<Room, any>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
];

const defaultSchedule =
  "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

type RoomsLoadedProps = {
  data: Room[];
  currentUserId: string;
  timetableId: string;
};

function RoomsLoaded({ data, currentUserId, timetableId }: RoomsLoadedProps) {
  const [defaultValues, setDefaultValues] = useState<FormValues>({
    name: "",
    schedule: defaultSchedule,
  });

  const handleCreate = () => {
    window["form-modal"].showModal();
    setDefaultValues({ name: "", schedule: defaultSchedule });
  };
  const handleEdit = (uid: string) => {
    const foundRoom = data.find((d) => d.uid === uid);

    if (foundRoom) {
      window["form-modal"].showModal();
      setDefaultValues({
        uid,
        name: foundRoom.name,
        schedule: foundRoom.schedule,
      });
    }
  };

  const handleDelete = (uid: string) => {
    const timetableFlatRef = ref(
      database,
      `users/${currentUserId}/timetables/${timetableId}/rooms/${uid}`
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

  console.log(formState);

  const handleSave = (data: FormValues) => {
    return new Promise<void>((resolve, reject) => {
      if (defaultValues.uid) {
        update(
          ref(
            database,
            `users/${currentUserId}/timetables/${timetableId}/rooms/${defaultValues.uid}`
          ),
          { name: data.name, schedule: data.schedule }
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        push(
          ref(
            database,
            `users/${currentUserId}/timetables/${timetableId}/rooms`
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
      title="Room"
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
