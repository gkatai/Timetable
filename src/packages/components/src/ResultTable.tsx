import ReactMarkdown from "react-markdown";

export type Result = {
  title: string;
  rows: {
    items: { title: string; content: string[]; warningLevel: number }[];
  }[];
};

export function ResultTable({ title, rows }: Result) {
  return (
    <div className="prose-sm lg:prose-base">
      <ReactMarkdown>{title}</ReactMarkdown>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>5</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.items.map((item, itemIndex) => (
                  <td key={itemIndex} className={getColor(item.warningLevel)}>
                    <ReactMarkdown>{item.title}</ReactMarkdown>
                    {item.content.map((c, contentIndex) => (
                      <div key={contentIndex}>{c}</div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getColor(warningLevel: number) {
  switch (warningLevel) {
    case 0:
      return "bg-success";
    case 1:
      return "bg-warning";
    case 2:
      return "bg-error";
  }
}
