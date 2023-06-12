import { Link, Outlet, useLocation, useParams } from "react-router-dom";

export default function Wizard() {
  const { uid } = useParams();
  const location = useLocation();

  let step = 1;
  if (location.pathname.includes("rooms")) {
    step = 1;
  } else if (location.pathname.includes("teachers")) {
    step = 2;
  } else if (location.pathname.includes("subjects")) {
    step = 3;
  } else if (location.pathname.includes("classes")) {
    step = 4;
  } else if (location.pathname.includes("generate")) {
    step = 5;
  }

  return (
    <div>
      <ul className="steps w-full py-8">
        <li className="step step-primary">
          <Link to={`/timetables/${uid}/rooms`}>Rooms</Link>
        </li>
        <li className={`step ${step > 1 && "step-primary"}`}>
          <Link to={`/timetables/${uid}/teachers`}>Teachers</Link>
        </li>
        <li className={`step ${step > 2 && "step-primary"}`}>
          <Link to={`/timetables/${uid}/subjects`}>Subjects</Link>
        </li>
        <li className={`step ${step > 3 && "step-primary"}`}>
          <Link to={`/timetables/${uid}/classes`}>Classes</Link>
        </li>
        <li className={`step ${step > 4 && "step-primary"}`}>
          <Link to={`/timetables/${uid}/generate`}>Generate</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
