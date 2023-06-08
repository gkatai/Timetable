import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD4g_KjsbyuSeLUkaDS7FQt5JauyRH4hrI",
  authDomain: "timetable-c8a23.firebaseapp.com",
  projectId: "timetable-c8a23",
  storageBucket: "timetable-c8a23.appspot.com",
  messagingSenderId: "793300686336",
  appId: "1:793300686336:web:c92a6248d29eb78430eae5",
  measurementId: "G-K7SGJEEN8H",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
