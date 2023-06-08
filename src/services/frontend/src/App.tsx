import { RouterProvider, createBrowserRouter } from "react-router-dom";

import Layout from "./components/Layout";
import Auth from "./pages/auth/Auth";
import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/home/Home";
import Timetables from "./pages/timetables/Timetables";

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
        path: "/auth",
        element: <Auth />,
        children: [
          {
            path: "timetables",
            element: <Timetables />,
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
