import { useOutletContext } from "react-router-dom";

import { Class, Timetable } from "../../timetables/timetable-types";

export default function Generate() {
  const { timetable }: { timetable: Timetable } = useOutletContext();

  return (
    <article className="prose-lg max-w-none">
      <h1>Summary</h1>
      <div>
        In this timetable you have{" "}
        <span className="font-bold">{timetable.rooms.length} rooms</span>,{" "}
        <span className="font-bold">{timetable.teachers.length} teachers</span>,{" "}
        <span className="font-bold">{timetable.subjects.length} subjects</span>,{" "}
        <span className="font-bold">{timetable.classes.length} classes</span>{" "}
        and{" "}
        <span className="font-bold">
          {countLessons(timetable.classes)} lessons
        </span>
      </div>
      {JSON.stringify(timetable)}
    </article>
  );
}

function countLessons(classes: Class[]): number {
  return classes.reduce((acc, curr) => {
    acc += Object.values(curr.lessons).length;
    return acc;
  }, 0);
}
