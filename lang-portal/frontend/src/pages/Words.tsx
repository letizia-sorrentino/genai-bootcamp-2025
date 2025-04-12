import { useEffect, useState } from "react"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { Word, PaginatedResponse, SortDirection } from "@/lib/types/api"
import { SortableTable } from "@/components/ui/table"
import { Link } from "react-router-dom"
import { Column } from "@/lib/types/table"
import { useAppSelector } from "@/store/hooks"

// Extend Word type to include score
type WordWithScore = Word & { score: number }

export default function Words() {
  const [sortColumn, setSortColumn] = useState<keyof WordWithScore>('italian')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  const { data: words, loading, error, request } = useApi<PaginatedResponse<Word>>()
  const wordStats = useAppSelector(state => state.wordStats.stats)

  useEffect(() => {
    request(() => api.getWords({
      page: 1,
      sortBy: sortColumn === 'score' ? 'italian' : sortColumn,
      sortDirection
    }))
  }, [request, sortColumn, sortDirection])

  const columns: Column<WordWithScore>[] = [
    {
      key: 'italian',
      header: 'Italian',
      sortable: true,
      render: (word) => (
        <Link to={`/words/${word.id}`} className="hover:underline">
          {word.italian}
        </Link>
      )
    },
    {
      key: 'english',
      header: 'English',
      sortable: true
    },
    {
      key: 'correct_count',
      header: 'Correct',
      sortable: true,
      render: (word) => {
        const stats = wordStats[word.id];
        return stats ? stats.correct_count : 0;
      }
    },
    {
      key: 'wrong_count',
      header: 'Wrong',
      sortable: true,
      render: (word) => {
        const stats = wordStats[word.id];
        return stats ? stats.wrong_count : 0;
      }
    },
    {
      key: 'score',
      header: 'Success Rate',
      sortable: true,
      render: (word) => {
        const stats = wordStats[word.id];
        if (!stats) return '0%';
        const total = stats.correct_count + stats.wrong_count;
        if (total === 0) return '0%';
        return `${Math.round((stats.correct_count / total) * 100)}%`;
      }
    }
  ]

  const handleSort = (column: keyof WordWithScore) => {
    if (column === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!words) return null

  console.log('All words:', words.data);
  console.log('Word stats:', wordStats);

  // Sort words based on current sort settings and add score property
  const sortedWords = [...words.data].map(word => {
    const stats = wordStats[word.id];
    const total = stats ? stats.correct_count + stats.wrong_count : 0;
    const score = total > 0 ? (stats.correct_count / total) * 100 : 0;
    return { ...word, score };
  }).sort((a, b) => {
    if (sortColumn === 'correct_count') {
      const statsA = wordStats[a.id];
      const statsB = wordStats[b.id];
      return (statsB?.correct_count || 0) - (statsA?.correct_count || 0) * (sortDirection === 'asc' ? -1 : 1);
    }
    if (sortColumn === 'wrong_count') {
      const statsA = wordStats[a.id];
      const statsB = wordStats[b.id];
      return (statsB?.wrong_count || 0) - (statsA?.wrong_count || 0) * (sortDirection === 'asc' ? -1 : 1);
    }
    if (sortColumn === 'score') {
      return (b.score - a.score) * (sortDirection === 'asc' ? -1 : 1);
    }
    
    // Handle string comparisons for italian and english
    if (typeof a[sortColumn] === 'string' && typeof b[sortColumn] === 'string') {
      return (a[sortColumn] as string).localeCompare(b[sortColumn] as string) * (sortDirection === 'asc' ? 1 : -1);
    }
    
    // Default numeric comparison
    return ((b[sortColumn] as number) || 0) - ((a[sortColumn] as number) || 0) * (sortDirection === 'asc' ? -1 : 1);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Words</h1>
      
      <div className="space-y-4">
        <SortableTable
          data={sortedWords}
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>
    </div>
  )
} 