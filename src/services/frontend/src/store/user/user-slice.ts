import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type User = {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
};

type UserLoggedOut = { kind: "user-logged-out" };

type UserLoggedIn = {
  kind: "user-logged-in";
  uid: string;
  email: string | null;
  isAnonymous: boolean;
};

type UserState = UserLoggedOut | UserLoggedIn;

const initialState: UserState = { kind: "user-logged-out" };

const userSlice = createSlice({
  name: "user",
  initialState: initialState as UserState,
  reducers: {
    logInUser: (_, action: PayloadAction<User>) => ({
      kind: "user-logged-in",
      uid: action.payload.uid,
      email: action.payload.email,
      isAnonymous: action.payload.isAnonymous,
    }),
    logOutUser: (state) => {
      state.kind = "user-logged-out";
    },
  },
});

export const userActions = userSlice.actions;
export default userSlice.reducer;
