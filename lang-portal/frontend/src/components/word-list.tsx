import { AudioPlayer } from "./ui/audio-player"
import { SortableTable } from "./ui/table"
import { Pagination } from "./ui/pagination"
import { Link } from "react-router-dom"

interface Word {
  id: number
  italian: string
  english: string
  audioUrl: string
  correctCount: number
  wrongCount: number
}

interface WordListProps {
  words: Word[]
  currentPage: number
  totalPages: number
  sortColumn?: keyof Word
  sortDirection?: 'asc' | 'desc'
  onPageChange: (page: number) => void
  onSort: (column: keyof Word) => void
  className?: string
}

export function WordList({
  words,
  currentPage,
  totalPages,
  sortColumn,
  sortDirection,
  onPageChange,
  onSort,
  className
}: WordListProps) {
  const columns = [
    {
      key: 'italian',
      header: 'Italian',
      sortable: true,
      render: (word: Word) => (
        <div className="flex items-center gap-2">
          <AudioPlayer src={word.audioUrl} />
          <Link to={`/words/${word.id}`} className="hover:underline">
            {word.italian}
          </Link>
        </div>
      )
    },
    {
      key: 'english',
      header: 'English',
      sortable: true
    },
    {
      key: 'correctCount',
      header: '# Correct',
      sortable: true
    },
    {
      key: 'wrongCount',
      header: '# Wrong',
      sortable: true
    }
  ]

  return (
    <div className="space-y-4">
      <SortableTable
        data={words}
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={onSort}
        className={className}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
} 