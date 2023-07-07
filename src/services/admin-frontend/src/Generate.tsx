import { ResultTable } from "@timetable/components";
import { Result } from "@timetable/components/src/ResultTable";
import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { mapToServerData, useGetTimetables } from "./helpers";

export default function Generate() {
  const { uid } = useParams();
  const timetables = useGetTimetables();
  const [results, setResults] = useState<Result[]>([]);

  const handleGenerateClick = () => {
    const foundTimetable = timetables.find((tt) => tt.uid === uid);
    if (!foundTimetable) {
      return;
    }

    axios
      .post(
        "http://localhost/Timetable",
        JSON.stringify(mapToServerData(foundTimetable)),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setResults(response.data.results))
      .catch((error) => console.log(error));
  };

  return (
    <div>
      <button className="btn btn-primary" onClick={handleGenerateClick}>
        Generate
      </button>
      {results.map((result, index) => (
        <ResultTable key={index} rows={result.rows} title={result.title} />
      ))}
    </div>
  );
}
