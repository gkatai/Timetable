import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "./root-reducer";
import { timetablesMiddleware } from "./timetable/timetables-middleware";
import { userMiddleware } from "./user/user-middleware";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userMiddleware).concat(timetablesMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
