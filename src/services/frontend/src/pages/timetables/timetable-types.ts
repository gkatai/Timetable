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

export const subjectSchema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2),
  occupation: occupationSchema,
  rooms: z.array(z.string()).min(1).max(3),
});

export type Subject = z.infer<typeof subjectSchema>;

export type Lesson = {
  uid: string;
};

export type Class = {
  uid: string;
  name: string;
  lessons: Lesson[];
};

export type TimetableFlat = {
  uid: string;
  name: string;
};

export type Timetable = {
  uid: string;
  rooms: Room[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
};
