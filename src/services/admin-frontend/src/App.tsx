import { LoginWithEmail } from "@timetable/components";
import { auth, database, databaseOperations } from "@timetable/firebase";
import {
  Timetable,
  TimetablesRecord,
  mapTimetablesRecord,
} from "@timetable/types";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="flex justify-center">
      <div className="w-full p-4 lg:max-w-6xl">
        {!user ? <LoginWithEmail /> : <Timetables />}
      </div>
    </div>
  );
}

export default App;

type TimetableWithUserId = Timetable & { userId: string };

function Timetables() {
  const [timetables, setTimetables] = useState<TimetableWithUserId[]>([]);

  useEffect(() => {
    const usersRef = databaseOperations.ref(database, "users");
    databaseOperations.onValue(usersRef, (snapshot) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setTimetables(mapUsersToTimetables(snapshot.val()));
    });
  }, []);

  console.log(timetables);

  return <div>Logged in</div>;
}

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
