import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { onValue, ref } from "firebase/database";

import { database } from "../../config/firebase";
import {
  Class,
  Lesson,
  Room,
  Subject,
  Teacher,
  Timetable,
} from "../../pages/timetables/timetable-types";
import { userActions } from "../user/user-slice";
import { timetablesActions } from "./timetables-slice";

export const timetablesMiddleware: Middleware = (store: MiddlewareAPI) => {
  return (next: (action: any) => void) => (action: any) => {
    const result = next(action);

    switch (action.type) {
      case userActions.logInUser.type: {
        const starCountRef = ref(
          database,
          `users/${store.getState().user.uid}/timetables`
        );
        onValue(starCountRef, (snapshot) => {
          const data = snapshot.val();
          store.dispatch(timetablesActions.update(mapTimetablesRecord(data)));
        });

        break;
      }
    }

    return result;
  };
};

type TimetablesRecord = Record<
  string,
  {
    name: string;
    rooms: Record<string, Omit<Room, "uid">> | undefined;
    teachers: Record<string, Omit<Teacher, "uid">> | undefined;
    subjects: Record<string, Omit<Subject, "uid">> | undefined;
    classes: Record<string, Omit<Class, "uid">> | undefined;
  }
>;

function mapTimetablesRecord(record: TimetablesRecord): Timetable[] {
  return Object.entries(record).map((entry) => ({
    uid: entry[0],
    name: entry[1].name,
    rooms: mapRoomsRecord(entry[1].rooms),
    teachers: mapTeachersRecord(entry[1].teachers),
    subjects: mapSubjectsRecord(entry[1].subjects),
    classes: mapClassesRecord(entry[1].classes),
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
    lessons: entry[1].lessons || [],
  }));
}
