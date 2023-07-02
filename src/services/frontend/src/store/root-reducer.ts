import { combineReducers } from "@reduxjs/toolkit";

import timetablesReducer from "./timetable/timetables-slice";
import userRedcuer from "./user/user-slice";

const rootReducer = combineReducers({
  user: userRedcuer,
  timetables: timetablesReducer,
});

export default rootReducer;
