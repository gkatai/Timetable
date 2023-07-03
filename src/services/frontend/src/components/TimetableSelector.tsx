import PropTypes from "prop-types";
import { useEffect, useState } from "react";

type TimetableSelectorProps = {
  defaultTimetableString: string;
  setTimetableString: (ttString: string) => void;
};

export default function TimetableSelector({
  defaultTimetableString,
  setTimetableString,
}: TimetableSelectorProps) {
  const [table, setTable] = useGetTable(defaultTimetableString);
  const [selectMode, setSelectMode] = useState(0);
  const [startPosition, setStartPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    let tempTimetableString = "";

    for (let i = 0; i < table.length; i++) {
      const row = table[i];
      for (let j = 0; j < row.length; j++) {
        tempTimetableString += row[j];
      }
    }

    setTimetableString(tempTimetableString);
  }, [table]);

  const handleMouseDown = (row: number, field: number) => {
    setStartPosition([row, field]);
  };

  const handleMouseUp = (row: number, field: number) => {
    const tempTable = [...table];

    for (let i = startPosition[0]; i < row + 1; i++) {
      for (let j = startPosition[1]; j < field + 1; j++) {
        tempTable[i][j] = selectMode;
      }
    }

    setTable(tempTable);
  };

  const handleMouseMove = (
    event: React.MouseEvent<HTMLTableDataCellElement, MouseEvent>,
    row: number,
    field: number
  ) => {
    if (event.buttons !== 1) {
      return;
    }

    const tempTable = [...table];

    for (let i = startPosition[0]; i < row + 1; i++) {
      for (let j = startPosition[1]; j < field + 1; j++) {
        tempTable[i][j] = 4;
      }
    }

    setTable(tempTable);
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className="btn-group mb-4">
        <label
          onClick={() => setSelectMode(0)}
          className={`btn ${selectMode !== 0 && "btn-outline"} btn-success`}
        >
          Free
        </label>
        <label
          onClick={() => setSelectMode(1)}
          className={`btn ${selectMode !== 1 && "btn-outline"} btn-error`}
        >
          Occupied
        </label>
        <label
          onClick={() => setSelectMode(2)}
          className={`btn ${selectMode !== 2 && "btn-outline"} btn-warning`}
        >
          Not suggested
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th className="w-28">Monday</th>
            <th className="w-28">Tuesday</th>
            <th className="w-28">Wednesday</th>
            <th className="w-28">Thursday</th>
            <th className="w-28">Friday</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td className="">{rowIndex + 1}</td>
              {row.map((field, fieldIndex) => (
                <td
                  key={fieldIndex}
                  onMouseMove={(e) => handleMouseMove(e, rowIndex, fieldIndex)}
                  onMouseDown={() => handleMouseDown(rowIndex, fieldIndex)}
                  onMouseUp={() => handleMouseUp(rowIndex, fieldIndex)}
                  style={{
                    backgroundColor: getBackgroundColor(
                      table[rowIndex][fieldIndex]
                    ),
                  }}
                >
                  {getFieldText(table[rowIndex][fieldIndex])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

TimetableSelector.propTypes = {
  defaultTimetableString: PropTypes.string,
  setTimetableString: PropTypes.func.isRequired,
};

TimetableSelector.defaultProps = {
  defaultTimetableString:
    "000000000000000000000000000000000000000000000000000000000000",
};

function useGetTable(
  defaultValue: string
): [number[][], React.Dispatch<React.SetStateAction<number[][]>>] {
  const maxHours = 12;
  const [table, setTable] = useState<number[][]>([]);

  useEffect(() => {
    const tempTable: number[][] = [];

    for (let im = 0; im < maxHours; im++) {
      tempTable[im] = [];
    }

    for (let i = 0; i < maxHours; i++) {
      for (let j = 0; j < 5; j++) {
        const currValue = defaultValue[i * 5 + j];
        tempTable[i][j] = currValue
          ? Number.parseInt(defaultValue[i * 5 + j])
          : 0;
      }
    }

    setTable(tempTable);
  }, [defaultValue]);

  return [table, setTable];
}

function getBackgroundColor(value: number) {
  switch (value) {
    case 0: {
      return "green";
    }
    case 1: {
      return "red";
    }
    case 2:
      return "orange";
    default:
      return "blue";
  }
}

function getFieldText(value: number) {
  switch (value) {
    case 0: {
      return "Free";
    }
    case 1: {
      return "Occupied";
    }
    case 2:
      return "Not suggested";
    default:
      return "";
  }
}
