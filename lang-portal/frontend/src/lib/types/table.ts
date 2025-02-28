export interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
} 