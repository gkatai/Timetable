import { z } from "zod";

export type Room = {
  uid: string;
  name: string;
  schedule: string;
};

export type Teacher = {
  uid: string;
  name: string;
  schedule: string;
};

export const occupationSchema = z.union([
  z.literal("free"),
  z.literal("occupied"),
  z.literal("registered"),
]);

export type Occupation = z.infer<typeof occupationSchema>;

export const reservationSchema = z.union([
  z.literal("free"),
  z.literal("registered"),
  z.literal("mandatory"),
]);

export type Reservation = z.infer<typeof reservationSchema>;

export const subjectSchema = z
  .object({
    uid: z.string().optional(),
    name: z.string().min(2),
    occupation: occupationSchema,
    rooms: z.array(z.string()).max(3),
  })
  .superRefine((val, ctx) => {
    if (val.occupation !== "free" && val.rooms.length === 0) {
      ctx.addIssue({
        path: ["rooms"],
        code: "too_small",
        type: "array",
        message: "If occupation is not free, select at least 1 room",
        minimum: 1,
        inclusive: true,
      });
    }
  });

export type Subject = z.infer<typeof subjectSchema>;

export const lessonsSchema = z.object({
  uid: z.string().optional(),
  numberOfLessons: z.preprocess((val) => {
    if (typeof val === "string") return Number.parseInt(val);
    else {
      return 0;
    }
  }, z.number().min(1).max(10)),
  doubleClass: z.boolean(),
  first: z.boolean(),
  last: z.boolean(),
  firstTeacher: z.string().min(1),
  firstSubject: z.string().min(1),
  firstOtherClass: z.string().optional(),
  firstReservation: reservationSchema.default("free"),
  divided: z.boolean().default(false),
  secondTeacher: z.string().optional(),
  secondSubject: z.string().optional(),
  secondOtherClass: z.string().optional(),
  secondReservation: reservationSchema.optional(),
});

export type Lesson = z.infer<typeof lessonsSchema>;

export const classesSchema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2),
  lessons: z.any(),
});

export type Class = z.infer<typeof classesSchema>;

export type Timetable = {
  uid: string;
  name: string;
  rooms: Room[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  results?: Result[];
};

export type TimetablesRecord = Record<
  string,
  {
    name: string;
    rooms: Record<string, Omit<Room, "uid">> | undefined;
    teachers: Record<string, Omit<Teacher, "uid">> | undefined;
    subjects: Record<string, Omit<Subject, "uid">> | undefined;
    classes: Record<string, Omit<Class, "uid">> | undefined;
    results?: Result[];
  }
>;

export type Result = {
  title: string;
  rows: {
    items: { title: string; content: string[]; warningLevel: number }[];
  }[];
};

export function mapTimetablesRecord(record: TimetablesRecord): Timetable[] {
  if (!record) {
    return [];
  }

  return Object.entries(record).map((entry) => ({
    uid: entry[0],
    name: entry[1].name,
    rooms: mapRoomsRecord(entry[1].rooms),
    teachers: mapTeachersRecord(entry[1].teachers),
    subjects: mapSubjectsRecord(entry[1].subjects),
    classes: mapClassesRecord(entry[1].classes),
    results: entry[1].results,
  }));
}

function mapRoomsRecord(
  record: Record<string, Omit<Room, "uid">> | undefined
): Room[] {
  if (!record) {
    return [];
  }

  return Object.entries(record).map((entry) => ({
    uid: entry[0],
    name: entry[1].name,
    schedule: entry[1].schedule,
  }));
}

function mapTeachersRecord(
  record: Record<string, Omit<Teacher, "uid">> | undefined
): Teacher[] {
  if (!record) {
    return [];
  }

  return Object.entries(record).map((entry) => ({
    uid: entry[0],
    name: entry[1].name,
    schedule: entry[1].schedule,
  }));
}

function mapSubjectsRecord(
  record: Record<string, Omit<Subject, "uid">> | undefined
): Subject[] {
  if (!record) {
    return [];
  }

  return Object.entries(record).map((entry) => ({
    uid: entry[0],
    name: entry[1].name,
    occupation: entry[1].occupation,
    rooms: entry[1].rooms,
  }));
}

function mapClassesRecord(
  record: Record<string, Omit<Class, "uid">> | undefined
): Class[] {
  if (!record) {
    return [];
  }

  return Object.entries(record).map((entry) => ({
    uid: entry[0],
    name: entry[1].name,
    lessons: mapLessonsRecord(entry[1].lessons),
  }));
}

function mapLessonsRecord(
  record: Record<string, Lesson> | undefined
): Lesson[] {
  if (!record) {
    return [];
  }

  return Object.entries(record).map((entry) => ({
    uid: entry[0],
    ...entry[1],
  }));
}
