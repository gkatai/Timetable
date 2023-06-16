import { DataSnapshot, ref } from "firebase/database";
import { useList } from "react-firebase-hooks/database";

import { database } from "../../../config/firebase";

export function useGetData(
  currentUserId: string,
  timetableId?: string
): [
  {
    subjects: DataSnapshot[] | undefined;
    rooms: DataSnapshot[] | undefined;
  },
  boolean,
  string | null
] {
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

  const data = { subjects, rooms };
  const loading = subjectsLoading || roomsLoading;
  let error: string | null = null;

  if (subjectsError || roomsError) {
    error = "Error fetching data!";
  }

  return [data, loading, error];
}
