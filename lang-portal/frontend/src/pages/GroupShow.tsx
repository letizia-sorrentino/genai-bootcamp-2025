import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useApi } from "@/lib/hooks/use-api"
import { api } from "@/lib/api-client"
import { WordGroup, Word, StudySession, PaginatedResponse, SortDirection } from "@/lib/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SortableTable } from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { format } from "date-fns"
import { AudioPlayer } from "@/components/ui/audio-player"
import { Column } from "@/lib/types/table"
import { Link } from "react-router-dom"
import { useAppSelector } from "@/store/hooks"

export default function GroupShow() {
  const { id } = useParams()
  const [wordsPage, setWordsPage] = useState(1)
  const [sessionsPage, setSessionsPage] = useState(1)
  const [wordSort, setWordSort] = useState<{column: keyof Word, direction: SortDirection}>({
    column: 'italian',
    direction: 'asc'
  })

  const { data: group, loading, error, request } = useApi<WordGroup>()
  const { 
    data: words,
    loading: wordsLoading,
    request: requestWords 
  } = useApi<PaginatedResponse<Word>>()
  const {
    data: sessions,
    loading: sessionsLoading,
    request: requestSessions
  } = useApi<PaginatedResponse<StudySession>>()

  // Get stats from Redux store
  const wordStats = useAppSelector(state => state.wordStats.stats)
  const sessionStats = useAppSelector(state => state.sessionStats)

  // Calculate group statistics
  const getGroupStats = () => {
    if (!words?.data) return { totalCorrect: 0, totalWrong: 0, successRate: 0 }

    const groupWords = words.data
    let totalCorrect = 0
    let totalWrong = 0

    groupWords.forEach(word => {
      const stats = wordStats[word.id]
      if (stats) {
        totalCorrect += stats.correct_count
        totalWrong += stats.wrong_count
      }
    })

    const totalAttempts = totalCorrect + totalWrong
    const successRate = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

    return { totalCorrect, totalWrong, successRate }
  }

  // Get last study session for this group
  const getLastStudySession = () => {
    return sessionStats.recentSessions.find(session => session.groupId === Number(id))
  }

  useEffect(() => {
    if (id) {
      request(() => api.getWordGroup(Number(id)))
      requestWords(() => api.getGroupWords(Number(id), {
        page: wordsPage,
        sortBy: wordSort.column,
        sortDirection: wordSort.direction
      }))
      requestSessions(() => api.getGroupSessions(Number(id), {
        page: sessionsPage
      }))
    }
  }, [id, request, requestWords, requestSessions, wordsPage, sessionsPage, wordSort])

  const wordColumns: Column<Word>[] = [
    {
      key: 'italian' as keyof Word,
      header: 'Italian',
      sortable: true,
      render: (word: Word) => (
        <Link to={`/words/${word.id}`} className="hover:underline">
          {word.italian}
        </Link>
      )
    },
    {
      key: 'english' as keyof Word,
      header: 'English',
      sortable: true
    },
    {
      key: 'correct_count' as keyof Word,
      header: 'Correct',
      sortable: true,
      render: (word) => {
        const stats = wordStats[word.id];
        return stats ? stats.correct_count : 0;
      }
    },
    {
      key: 'wrong_count' as keyof Word,
      header: 'Wrong',
      sortable: true,
      render: (word) => {
        const stats = wordStats[word.id];
        return stats ? stats.wrong_count : 0;
      }
    },
    {
      key: 'score' as keyof Word,
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

  const sessionColumns: Column<StudySession>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (session: StudySession) => session.id
    },
    {
      key: 'activityName',
      header: 'Activity Name',
      render: () => 'Word Quiz'
    },
    {
      key: 'startTime',
      header: 'Start Time',
      render: (session: StudySession) => format(new Date(session.date), 'PPp')
    },
    {
      key: 'score',
      header: 'Score',
      render: (session: StudySession) => `${Math.round(session.score)}%`
    },
    {
      key: 'total',
      header: '# Words',
      render: (session: StudySession) => session.total
    }
  ]

  const handleWordSort = (column: keyof Word) => {
    setWordSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!group) return null

  const stats = getGroupStats()
  const lastSession = getLastStudySession()
  const groupSessions = sessionStats.recentSessions.filter(session => session.groupId === Number(id))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{group.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Group Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Words</div>
              <p className="text-2xl font-bold">15</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <p className="text-2xl font-bold">{Math.round(stats.successRate)}%</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
              <p className="text-2xl font-bold text-green-600">{stats.totalCorrect}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Wrong Answers</div>
              <p className="text-2xl font-bold text-red-600">{stats.totalWrong}</p>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last Studied</div>
            <p>{lastSession ? format(new Date(lastSession.date), 'PPp') : 'Never'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Words</h2>
        {wordsLoading ? (
          <div>Loading words...</div>
        ) : words?.data ? (
          <>
            <SortableTable
              data={words.data}
              columns={wordColumns}
              sortColumn={wordSort.column}
              sortDirection={wordSort.direction}
              onSort={handleWordSort}
            />
            <Pagination
              currentPage={wordsPage}
              totalPages={words.pagination.total_pages}
              onPageChange={setWordsPage}
            />
          </>
        ) : null}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Study Sessions</h2>
        {groupSessions.length > 0 ? (
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {groupSessions.map((session, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">
                      {format(new Date(session.date), 'PPp')}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{Math.round(session.score)}%</div>
                      <div className="text-sm text-gray-500">{session.total} words</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-4 text-center text-muted-foreground">
              No study sessions yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 