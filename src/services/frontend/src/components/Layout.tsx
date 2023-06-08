import { useEffect, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { FiLogOut, FiSettings, FiLogIn } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";
import { auth } from "../config/firebase";

export default function Layout() {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
  }, []);

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
              <li>{currentUser && currentUser.email}</li>
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
                {currentUser ? (
                  <li onMouseDown={() => auth.signOut()}>
                    <a>
                      <FiLogOut /> Logout
                    </a>
                  </li>
                ) : (
                  <li>
                    <Link to="/auth/login">
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
