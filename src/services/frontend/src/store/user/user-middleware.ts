import { Middleware, MiddlewareAPI } from "@reduxjs/toolkit";
import { auth } from "@timetable/firebase";
import { onAuthStateChanged } from "@timetable/firebase";

import { userActions } from "./user-slice";

export const userMiddleware: Middleware = (store: MiddlewareAPI) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      store.dispatch(
        userActions.logInUser({
          uid: user.uid,
          email: user.email,
          isAnonymous: user.isAnonymous,
        })
      );
    } else {
      store.dispatch(userActions.logOutUser());
    }
  });

  return (next: (action: any) => void) => (action: any) => {
    const result = next(action);

    return result;
  };
};
