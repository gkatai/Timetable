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

export const lessonsSchema = z.object({
  uid: z.string().optional(),
});

export type Lesson = z.infer<typeof lessonsSchema>;

export const classesSchema = z.object({
  uid: z.string().optional(),
  name: z.string().min(2),
  lessons: z.array(lessonsSchema),
});

export type Class = z.infer<typeof classesSchema>;

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
