import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@timetable/components";
import { SimpleTable } from "@timetable/components";
import { database } from "@timetable/firebase";
import { User, databaseOperations } from "@timetable/firebase";
import {
  Class,
  Lesson,
  Subject,
  Teacher,
  Timetable,
  lessonsSchema,
} from "@timetable/types";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useOutletContext, useParams } from "react-router-dom";
import { z } from "zod";

import { Modal } from "../../../components/Modal";

type LessonData = {
  lessons: Lesson[];
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
};

export default function Lessons() {
  const { timetableUid, classId } = useParams();
  const {
    currentUser,
    timetable,
  }: { currentUser: User; timetable: Timetable } = useOutletContext();

  const mappedData: LessonData = useMemo<LessonData>(() => {
    const foundClass = timetable.classes.find((c) => c.uid === classId);

    if (!classId || !foundClass) {
      return {
        classes: [],
        lessons: [],
        subjects: [],
        teachers: [],
      };
    }

    return {
      lessons: foundClass.lessons,
      classes: timetable.classes,
      subjects: timetable.subjects,
      teachers: timetable.teachers,
    };
  }, [timetable, classId]);

  if (!timetableUid) {
    return <Navigate to="/timetables" />;
  }

  if (!classId) {
    return <Navigate to={`/timetables/${timetableUid}/classes`} />;
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
    secondTeacher: "",
    secondSubject: "",
    secondOtherClass: "",
    secondReservation: "free",
  });

  const columns = useMemo<ColumnDef<Lesson>[]>(
    () => [
      {
        header: "Number of lessons",
        accessorKey: "numberOfLessons",
      },
      {
        header: "First teacher",
        accessorFn: (val) => {
          const foundTeacher = data.teachers.find(
            (t) => t.uid === val.firstTeacher
          );
          return foundTeacher ? foundTeacher.name : "";
        },
      },
    ],
    [data.teachers]
  );

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
      secondTeacher: "",
      secondSubject: "",
      secondOtherClass: "",
      secondReservation: "free",
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
    const timetableFlatRef = databaseOperations.ref(
      database,
      `users/${currentUserId}/timetables/${timetableId}/classes/${classId}/lessons/${uid}`
    );

    databaseOperations.remove(timetableFlatRef);
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
        deleteAction={(uid) => handleDelete(uid)}
        editAction={(uid) => handleEdit(uid)}
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
        databaseOperations
          .update(
            databaseOperations.ref(
              database,
              `users/${currentUserId}/timetables/${timetableId}/classes/${classId}/lessons/${defaultValues.uid}`
            ),
            data
          )
          .then(() => resolve())
          .catch((error) => reject(error));
      } else {
        databaseOperations
          .push(
            databaseOperations.ref(
              database,
              `users/${currentUserId}/timetables/${timetableId}/classes/${classId}/lessons`
            ),
            data
          )
          .then(() => resolve())
          .catch((error) => reject(error));
      }
    });
  };

  return (
    <Modal
      title="Lesson"
      save={handleSave}
      reset={reset}
      handleSubmit={handleSubmit}
    >
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

      {isDivided && (
        <>
          <Input label="Second teacher" error={errors["secondTeacher"]}>
            <select
              className="select select-bordered w-full"
              {...register("secondTeacher")}
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

          <Input label="Second subject" error={errors["secondSubject"]}>
            <select
              className="select select-bordered w-full"
              {...register("secondSubject")}
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

          <Input label="Second other class" error={errors["secondOtherClass"]}>
            <select
              className="select select-bordered w-full"
              {...register("secondOtherClass")}
            >
              <option value="" disabled>
                Please select a class
              </option>
              {classes.map((_class) => (
                <option key={_class.uid} value={_class.uid}>
                  {_class.name}
                </option>
              ))}
            </select>
          </Input>

          <Input label="Second reservation" error={errors["secondReservation"]}>
            <select
              className="select select-bordered w-full"
              {...register("secondReservation")}
            >
              <option value="free">Free</option>
              <option value="registered">Registered</option>
              <option value="mandatory">Mandatory</option>
            </select>
          </Input>
        </>
      )}
    </Modal>
  );
}
