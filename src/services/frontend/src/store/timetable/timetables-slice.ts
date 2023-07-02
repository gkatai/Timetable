import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Timetable } from "../../pages/timetables/timetable-types";

type TimetablesPending = { kind: "timetables-pending" };

type TimetablesLoaded = { kind: "timetables-loaded"; data: Timetable[] };

type TimetablesState = TimetablesPending | TimetablesLoaded;

const initialState: TimetablesState = { kind: "timetables-pending" };

const timetablesSlice = createSlice({
  name: "timetables",
  initialState: initialState as TimetablesState,
  reducers: {
    update: (_, action: PayloadAction<Timetable[]>) => ({
      kind: "timetables-loaded",
      data: action.payload,
    }),
  },
});

export const timetablesActions = timetablesSlice.actions;
export default timetablesSlice.reducer;
