import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { database } from "@timetable/firebase";
import { databaseOperations } from "@timetable/firebase";
import { mapTimetablesRecord } from "@timetable/types";

import { userActions } from "../user/user-slice";
import { timetablesActions } from "./timetables-slice";

export const timetablesMiddleware: Middleware = (store: MiddlewareAPI) => {
  return (next: (action: any) => void) => (action: any) => {
    const result = next(action);

    switch (action.type) {
      case userActions.logInUser.type: {
        const starCountRef = databaseOperations.ref(
          database,
          `users/${store.getState().user.uid}/timetables`
        );
        databaseOperations.onValue(starCountRef, (snapshot) => {
          const data = snapshot.val();
          store.dispatch(timetablesActions.update(mapTimetablesRecord(data)));
        });

        break;
      }
    }

    return result;
  };
};
