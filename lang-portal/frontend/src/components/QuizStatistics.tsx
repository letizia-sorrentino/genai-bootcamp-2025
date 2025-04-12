import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuizStatistics() {
  const sessionStats = useAppSelector(state => state.sessionStats);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-2xl font-bold">{sessionStats.totalAttempts}</h3>
              <p className="text-gray-500">Total Attempts</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{sessionStats.correctAnswers}</h3>
              <p className="text-gray-500">Correct Answers</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{Math.round(sessionStats.averageScore)}%</h3>
              <p className="text-gray-500">Average Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessionStats.recentSessions.length === 0 ? (
            <p className="text-center text-gray-500">No sessions yet. Start practicing to see your progress!</p>
          ) : (
            <div className="space-y-4">
              {sessionStats.recentSessions.map((session, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">
                    {formatDate(session.date)}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{Math.round(session.score)}%</div>
                    <div className="text-sm text-gray-500">{session.total} words</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 