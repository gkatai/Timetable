import { DataSnapshot, ref } from "firebase/database";
import { useList } from "react-firebase-hooks/database";

import { database } from "../../../config/firebase";

export function useGetData(
  currentUserId: string,
  timetableId?: string
): [
  {
    classes: DataSnapshot[] | undefined;
    rooms: DataSnapshot[] | undefined;
    teachers: DataSnapshot[] | undefined;
    subjects: DataSnapshot[] | undefined;
  },
  boolean,
  string | null
] {
  const [classes, classesLoading, classesError] = useList(
    ref(
      database,
      `users/${currentUserId}/timetables/objects/${timetableId}/classes`
    )
  );

  const [teachers, teachersLoading, teachersError] = useList(
    ref(
      database,
      `users/${currentUserId}/timetables/objects/${timetableId}/teachers`
    )
  );

  const [subjects, subjectsLoading, subjectsError] = useList(
    ref(
      database,
      `users/${currentUserId}/timetables/objects/${timetableId}/subjects`
    )
  );

  const [rooms, roomsLoading, roomsError] = useList(
    ref(
      database,
      `users/${currentUserId}/timetables/objects/${timetableId}/rooms`
    )
  );

  const data = { classes, teachers, subjects, rooms };
  const loading =
    classesLoading || teachersLoading || subjectsLoading || roomsLoading;
  let error: string | null = null;

  if (classesError || teachersError || subjectsError || roomsError) {
    error = "Error fetching data!";
  }

  return [data, loading, error];
}
