import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"

interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface SortableTableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortColumn?: keyof T
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: keyof T) => void
  className?: string
}

export function SortableTable<T>({ 
  data, 
  columns, 
  sortColumn, 
  sortDirection, 
  onSort,
  className 
}: SortableTableProps<T>) {
  // Handle undefined or null data
  const tableData = Array.isArray(data) ? data : [];
  const hasData = tableData.length > 0;

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "p-3 text-left text-sm font-medium",
                  column.sortable && "cursor-pointer hover:bg-muted"
                )}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortColumn === column.key && (
                    sortDirection === 'asc' 
                      ? <ChevronUpIcon className="h-4 w-4" />
                      : <ChevronDownIcon className="h-4 w-4" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasData ? (
            tableData.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-muted/50"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="p-3 text-sm"
                  >
                    {column.render 
                      ? column.render(item)
                      : String(item[column.key] ?? '')
                    }
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-3 text-center text-sm text-muted-foreground">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
} 