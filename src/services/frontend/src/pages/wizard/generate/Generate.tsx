import { ResultTable } from "@timetable/components";
import { Class, Timetable } from "@timetable/types";
import { useOutletContext } from "react-router-dom";

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
      <div className="divider my-8" />

      {timetable.results &&
        timetable.results.map((result, index) => (
          <ResultTable key={index} rows={result.rows} title={result.title} />
        ))}
    </article>
  );
}

function countLessons(classes: Class[]): number {
  return classes.reduce((acc, curr) => {
    acc += Object.values(curr.lessons).length;
    return acc;
  }, 0);
}
