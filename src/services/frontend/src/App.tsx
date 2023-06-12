import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./components/Layout";
import Auth from "./pages/auth/Auth";
import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/home/Home";
import Timetables from "./pages/timetables/Timetables";
import Wizard from "./pages/wizard/Wizard";
import Classes from "./pages/wizard/classes/Classes";
import Generate from "./pages/wizard/generate/Generate";
import Rooms from "./pages/wizard/rooms/Rooms";
import Subjects from "./pages/wizard/subjects/Subjects";
import Teachers from "./pages/wizard/teachers/Teachers";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/timetables",
        element: <Auth />,
        children: [
          {
            path: "/timetables",
            element: <Timetables />,
          },
          {
            path: "/timetables/:uid",
            element: <Wizard />,
            children: [
              {
                path: "/timetables/:uid/rooms",
                element: <Rooms />,
              },
              {
                path: "/timetables/:uid/teachers",
                element: <Teachers />,
              },
              {
                path: "/timetables/:uid/subjects",
                element: <Subjects />,
              },
              {
                path: "/timetables/:uid/classes",
                element: <Classes />,
              },
              {
                path: "/timetables/:uid/generate",
                element: <Generate />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
