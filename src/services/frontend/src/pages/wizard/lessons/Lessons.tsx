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
  Lesson,
  Subject,
  Teacher,
  lessonsSchema,
} from "../../timetables/timetable-types";
import { useGetLessons } from "./lesson-helpers";

type LessonData = {
  lessons: Lesson[];
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
};

export default function Lessons() {
  const { timetableUid, classId } = useParams();
  const currentUser: User = useOutletContext();

  const [data, loading, error] = useGetLessons(
    currentUser.uid,
    timetableUid,
    classId
  );

  const mappedData: LessonData = useMemo<LessonData>(() => {
    if (!data.lessons || !data.classes || !data.subjects || !data.teachers) {
      return { lessons: [], classes: [], subjects: [], teachers: [] };
    }

    return {
      lessons: data.lessons.map((l) => ({ uid: l.key, ...l.val() })),
      classes: data.classes
        .map((c) => ({ uid: c.key, ...c.val() }))
        .filter((c) => c.uid !== classId),
      subjects: data.subjects.map((s) => ({ uid: s.key, ...s.val() })),
      teachers: data.teachers.map((t) => ({ uid: t.key, ...t.val() })),
    };
  }, [data, classId]);

  if (!timetableUid) {
    return <Navigate to="/timetables" />;
  }

  if (!classId) {
    return <Navigate to={`/timetables/${timetableUid}/classes`} />;
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

  return (
    <>
      <Link
        className="btn btn-primary"
        to={`/timetables/${timetableUid}/classes`}
      >
        Back to classes
      </Link>
      <LessonsLoaded
        data={mappedData}
        currentUserId={currentUser.uid}
        timetableId={timetableUid}
        classId={classId}
      />
    </>
  );
}

type FormValues = z.infer<typeof lessonsSchema>;

const columns: ColumnDef<Lesson>[] = [
  {
    header: "Name",
    accessorKey: "name",
  },
];

type LessonsLoadedProps = {
  data: LessonData;
  currentUserId: string;
  timetableId: string;
  classId: string;
};

function LessonsLoaded({
  data,
  currentUserId,
  timetableId,
  classId,
}: LessonsLoadedProps) {
  const [defaultValues, setDefaultValues] = useState<FormValues>({
    numberOfLessons: 0,
    doubleClass: false,
    first: false,
    last: false,
    firstTeacher: "",
    firstSubject: "",
    firstReservation: "free",
    divided: false,
  });

  const handleCreate = () => {
    window["form-modal"].showModal();
    setDefaultValues({
      numberOfLessons: 0,
      doubleClass: false,
      first: false,
      last: false,
      firstTeacher: "",
      firstSubject: "",
      firstOtherClass: "",
      firstReservation: "free",
      divided: false,
    });
  };
  const handleEdit = (uid: string) => {
    const foundLesson = data.lessons.find((d) => d.uid === uid);
    if (foundLesson) {
      window["form-modal"].showModal();
      setDefaultValues(foundLesson);
    }
  };
  const handleDelete = (uid: string) => {
    const timetableFlatRef = ref(
      database,
      `users/${currentUserId}/timetables/objects/${timetableId}/classes/${uid}?shallow=true`
    );

    remove(timetableFlatRef);
  };

  return (
    <>
      <Form
        currentUserId={currentUserId}
        defaultValues={defaultValues}
        timetableId={timetableId}
        classId={classId}
        teachers={data.teachers}
        classes={data.classes}
        subjects={data.subjects}
      />
      <SimpleTable
        data={data.lessons}
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
  classId: string;
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
};

function Form({
  currentUserId,
  defaultValues,
  timetableId,
  classId,
  teachers,
  classes,
  subjects,
}: FormProps) {
  const {
    formState: { errors },
    register,
    reset,
    handleSubmit,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(lessonsSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const isDivided = watch("divided");

  const handleSave = (data: FormValues) => {
    return new Promise<void>((resolve, reject) => {
      if (defaultValues.uid) {
        update(
          ref(
            database,
            `users/${currentUserId}/timetables/objects/${timetableId}/classes/${classId}/lessons/${defaultValues.uid}`
          ),
          {}
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        push(
          ref(
            database,
            `users/${currentUserId}/timetables/objects/${timetableId}/classes/${classId}/timetables`
          ),
          {}
        )
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  };

  return (
    <Modal save={handleSave} reset={reset} handleSubmit={handleSubmit}>
      <Input label="Number of lessons" error={errors["numberOfLessons"]}>
        <input
          type="number"
          className="input input-bordered w-full"
          {...register("numberOfLessons")}
        />
      </Input>

      <div className="flex justify-between w-full">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Double class</span>
          </label>
          <input
            type="checkbox"
            className="toggle"
            {...register("doubleClass")}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">First</span>
          </label>
          <input type="checkbox" className="toggle" {...register("first")} />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Last</span>
          </label>
          <input type="checkbox" className="toggle" {...register("last")} />
        </div>
      </div>

      <Input label="First teacher" error={errors["firstTeacher"]}>
        <select
          className="select select-bordered w-full"
          {...register("firstTeacher")}
        >
          <option value="" disabled>
            Please select a teacher
          </option>
          {teachers.map((teacher) => (
            <option key={teacher.uid} value={teacher.uid}>
              {teacher.name}
            </option>
          ))}
        </select>
      </Input>

      <Input label="First subject" error={errors["firstSubject"]}>
        <select
          className="select select-bordered w-full"
          {...register("firstSubject")}
        >
          <option value="" disabled>
            Please select a subject
          </option>
          {subjects.map((subject) => (
            <option key={subject.uid} value={subject.uid}>
              {subject.name}
            </option>
          ))}
        </select>
      </Input>

      <Input label="First other class" error={errors["firstOtherClass"]}>
        <select
          className="select select-bordered w-full"
          {...register("firstOtherClass")}
        >
          <option value="">Please select a class</option>
          {classes.map((_class) => (
            <option key={_class.uid} value={_class.uid}>
              {_class.name}
            </option>
          ))}
        </select>
      </Input>

      <Input label="First reservation" error={errors["firstReservation"]}>
        <select
          className="select select-bordered w-full"
          {...register("firstReservation")}
        >
          <option value="free">Free</option>
          <option value="registered">Registered</option>
          <option value="mandatory">Mandatory</option>
        </select>
      </Input>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Divided</span>
        </label>
        <input type="checkbox" className="toggle" {...register("divided")} />
      </div>

      {isDivided && <></>}
    </Modal>
  );
}
