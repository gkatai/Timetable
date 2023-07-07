import { database, databaseOperations } from "@timetable/firebase";
import {
  Class,
  Lesson,
  Occupation,
  Reservation,
  Room,
  Subject,
  Teacher,
  Timetable,
  TimetablesRecord,
  mapTimetablesRecord,
} from "@timetable/types";
import { useEffect, useState } from "react";

export function useGetTimetables() {
  const [timetables, setTimetables] = useState<TimetableWithUserId[]>([]);

  useEffect(() => {
    const usersRef = databaseOperations.ref(database, "users");
    databaseOperations.onValue(usersRef, (snapshot) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setTimetables(mapUsersToTimetables(snapshot.val()));
    });
  }, []);

  return timetables;
}

type TimetableWithUserId = Timetable & { userId: string };

type UsersRecord = Record<string, Record<"timetables", TimetablesRecord>>;

function mapUsersToTimetables(users: UsersRecord): TimetableWithUserId[] {
  return Object.entries(users).reduce(
    (acc: TimetableWithUserId[], userEntry) => {
      const timetables: Timetable[] = mapTimetablesRecord(
        userEntry[1].timetables
      );

      timetables.forEach((tt) => {
        acc.push({ userId: userEntry[0], ...tt });
      });

      return acc;
    },
    []
  );
}

type ServerTeacher = { id: string; name: string; timetable: string };

type ServerRoom = { id: string; name: string; timetable: string };

type ServerSubject = {
  id: string;
  name: string;
  occupation: number;
  rooms: string[];
};

type ServerLesson = {
  numberOfLessons: number;
  doubleClass: boolean;
  first: boolean;
  last: boolean;
  firstTeacher: string;
  firstSubject: string;
  firstOtherClass?: string;
  firstReservation: number;
  divided: boolean;
  secondTeacher?: string;
  secondSubject?: string;
  secondOtherClass?: string;
  secondReservation?: number;
};

type ServerClass = {
  id: string;
  name: string;
  lessons: ServerLesson[];
};

type ServerTimetable = {
  teachers: ServerTeacher[];
  rooms: ServerRoom[];
  subjects: ServerSubject[];
  classes: ServerClass[];
};

const mapTeachers = (teachers: Teacher[]): ServerTeacher[] => {
  return teachers.map((teacher) => ({
    id: teacher.uid,
    name: teacher.name,
    timetable: teacher.schedule,
  }));
};

const mapRooms = (rooms: Room[]): ServerRoom[] =>
  rooms.map((teacher) => ({
    id: teacher.uid,
    name: teacher.name,
    timetable: teacher.schedule,
  }));

function mapOccupation(occupation: Occupation): number {
  switch (occupation) {
    case "free":
      return 0;
    case "registered":
      return 1;
    case "occupied":
      return 2;
  }
}

const mapSubjects = (subjects: Subject[]): ServerSubject[] =>
  subjects.map((subject) => ({
    id: subject.uid!,
    name: subject.name,
    occupation: mapOccupation(subject.occupation),
    rooms: subject.rooms,
  }));

function mapReservation(reservation: Reservation) {
  switch (reservation) {
    case "free":
      return 0;
    case "mandatory":
      return 1;
    case "registered":
      return 2;
  }
}

const mapLessons = (lessons: Lesson[]): ServerLesson[] => {
  return lessons.map((lesson) => ({
    ...lesson,
    firstReservation: mapReservation(lesson.firstReservation),
    secondReservation: lesson.secondReservation
      ? mapReservation(lesson.secondReservation)
      : undefined,
  }));
};

const mapClasses = (classes: Class[]): ServerClass[] =>
  classes.map((c) => ({
    id: c.uid!,
    name: c.name,
    lessons: mapLessons(c.lessons),
  }));

export function mapToServerData(
  timetable: TimetableWithUserId
): ServerTimetable {
  return {
    teachers: mapTeachers(timetable.teachers),
    rooms: mapRooms(timetable.rooms),
    subjects: mapSubjects(timetable.subjects),
    classes: mapClasses(timetable.classes),
  };
}
