import { AiOutlineUser } from "react-icons/ai";
import { FiLogIn, FiLogOut, FiSettings } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";

import { auth } from "../config/firebase";
import { useAppSelector } from "../store/hooks";

export default function Layout() {
  const user = useAppSelector((state) => state.user);

  return (
    <>
      <div className="navbar w-full bg-base-300">
        <div className="navbar">
          <div className="navbar-start"></div>
          <div className="navbar-center">
            <Link to="/" className="btn-ghost btn text-xl normal-case">
              Timetable Wizard
            </Link>
          </div>
          <div className="navbar-end">
            <ul className="menu menu-horizontal hidden px-1 md:block">
              <li>
                {user.kind === "user-logged-in" &&
                  (user.isAnonymous ? "Guest" : user.email)}
              </li>
            </ul>
            <div className="dropdown-end dropdown">
              <label></label>
              <label className="btn-ghost btn-circle avatar btn">
                <button className="btn-ghost btn-circle btn">
                  <AiOutlineUser size={25} />
                </button>
              </label>
              <ul className="dropdown-content menu rounded-box menu-lg mt-6 bg-base-200 p-2">
                <li>
                  <a>
                    <FiSettings />
                    Settings
                  </a>
                </li>
                {user ? (
                  <li>
                    <a onMouseDown={() => auth.signOut()}>
                      <FiLogOut /> Logout
                    </a>
                  </li>
                ) : (
                  <li>
                    <Link to="/login">
                      <FiLogIn /> Login
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-full p-4 lg:max-w-6xl">
          <Outlet />
        </div>
      </div>
    </>
  );
}
