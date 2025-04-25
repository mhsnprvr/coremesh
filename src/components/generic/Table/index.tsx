import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

export interface TableProps {
  headings: Heading[];
  rows: ReactNode[][];
}

export interface Heading {
  title: string;
  type: "blank" | "normal";
  sortable: boolean;
}

/**
 * @param hopsAway String describing the number of hops away the node is from the current node
 * @returns number of hopsAway or `0` if hopsAway is 'Direct'
 */
function numericHops(hopsAway: string): number {
  if (hopsAway.match(/direct/i)) {
    return 0;
  }
  if (hopsAway.match(/\d+\s+hop/gi)) {
    return Number(hopsAway.match(/(\d+)\s+hop/i)?.[1]);
  }
  return Number.MAX_SAFE_INTEGER;
}

// Utility function to safely extract props
function getElementProps(element: ReactNode): Record<string, any> {
  if (element && typeof element === "object" && "props" in element) {
    return element.props || {};
  }
  return {};
}

export const Table = ({ headings, rows }: TableProps) => {
  const [sortColumn, setSortColumn] = useState<string | null>("Last Heard");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const headingSort = (title: string) => {
    if (sortColumn === title) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(title);
      setSortOrder("asc");
    }
  };

  const sortedRows = rows.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    const columnIndex = headings.findIndex((h) => h.title === sortColumn);
    const aValue = a[columnIndex];
    const bValue = b[columnIndex];

    const aProps = getElementProps(aValue);
    const bProps = getElementProps(bValue);

    // Custom comparison for 'Last Heard' column
    if (sortColumn === "Last Heard") {
      const aTimestamp = aProps.timestamp ?? 0;
      const bTimestamp = bProps.timestamp ?? 0;

      if (aTimestamp < bTimestamp) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aTimestamp > bTimestamp) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    }

    // Custom comparison for 'Connection' column
    if (sortColumn === "Connection") {
      const aChildren = aProps.children;
      const bChildren = bProps.children;

      const aNumHops = numericHops(
        Array.isArray(aChildren) ? aChildren[0] : aChildren
      );
      const bNumHops = numericHops(
        Array.isArray(bChildren) ? bChildren[0] : bChildren
      );

      if (aNumHops < bNumHops) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aNumHops > bNumHops) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    }

    // Default comparison for other columns
    if (aValue < bValue) {
      return sortOrder === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <table className="min-w-full">
      <thead className="bg-backgound-primary text-sm font-semibold text-text-primary">
        <tr>
          {headings.map((heading) => (
            <th
              key={heading.title}
              scope="col"
              className={`py-2 pr-3 text-left ${
                heading.sortable
                  ? "cursor-pointer hover:brightness-hover active:brightness-press"
                  : ""
              }`}
              onClick={() => heading.sortable && headingSort(heading.title)}
              onKeyUp={() => heading.sortable && headingSort(heading.title)}
            >
              <div className="flex gap-2">
                {heading.title}
                {sortColumn === heading.title &&
                  (sortOrder === "asc" ? (
                    <ChevronUpIcon size={16} />
                  ) : (
                    <ChevronDownIcon size={16} />
                  ))}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, rowIndex) => (
          <tr
            key={`row-${rowIndex}`}
            className={`${
              rowIndex % 2
                ? "bg-white dark:bg-white/2"
                : "bg-slate-50/50 dark:bg-slate-50/5"
            } border-b-1 border-slate-200 dark:border-slate-900`}
          >
            {row.map((item, cellIndex) =>
              cellIndex === 0 ? (
                <th
                  key={`cell-th-${rowIndex}-${cellIndex}`}
                  className="whitespace-nowrap py-2 text-sm text-text-secondary first:pl-2"
                  scope="row"
                >
                  {item}
                </th>
              ) : (
                <td
                  key={`cell-td-${rowIndex}-${cellIndex}`}
                  className="whitespace-nowrap py-2 text-sm text-text-secondary first:pl-2"
                >
                  {item}
                </td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
