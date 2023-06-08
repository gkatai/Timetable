import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Register from "./pages/auth/Register";
import Layout from "./components/Layout";
import Home from "./pages/Home/Home";
import Login from "./pages/auth/Login";

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
        path: "timetables",
        element: <h1>timetables</h1>,
      },
    ],
  },
  {
    path: "/auth/register",
    element: <Register />,
  },
  {
    path: "/auth/login",
    element: <Login />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
