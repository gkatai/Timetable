import { Link, useParams } from "react-router-dom";

export default function Lessons() {
  const { timetableUid, classId } = useParams();

  return (
    <>
      <Link
        className="btn btn-primary"
        to={`/timetables/${timetableUid}/classes`}
      >
        Back to classes
      </Link>
      {timetableUid} - {classId}
    </>
  );
}
