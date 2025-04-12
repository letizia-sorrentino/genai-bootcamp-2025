import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/lib/hooks/use-api';
import { api } from '@/lib/api-client';
import { Word, PaginatedResponse } from '@/lib/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateWordStats, setMultipleWordStats } from '@/store/wordStatsSlice';
import { updateSessionStats, completeSession, resetSessionStats } from '@/store/sessionStatsSlice';

interface WordQuizProps {
  groupId?: number;
  wordCount?: number;
}

export default function WordQuiz({ groupId, wordCount = 10 }: WordQuizProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wordStats = useAppSelector(state => state.wordStats.stats);
  const statsLoading = useAppSelector(state => state.wordStats.loading);
  const statsError = useAppSelector(state => state.wordStats.error);
  const sessionStats = useAppSelector(state => state.sessionStats);

  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const { request } = useApi<PaginatedResponse<Word>>();

  useEffect(() => {
    loadWords();
    dispatch(resetSessionStats());
  }, []);

  const loadWords = async () => {
    setIsLoading(true);
    try {
      const response = await request(() => 
        groupId 
          ? api.getGroupWords(groupId)
          : api.getWords()
      );
      
      if (response?.data) {
        console.log('Received words from API:', response.data);
        
        if (response.data.length === 0) {
          console.error('No words received from API');
          return;
        }

        setAvailableWords(response.data);
        
        // Only initialize stats for words that don't already have stats
        const wordsToInitialize = response.data.filter(word => !wordStats[word.id]);
        if (wordsToInitialize.length > 0) {
          dispatch(setMultipleWordStats(wordsToInitialize));
        }
        
        selectNewWord(response.data);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectNewWord = (words: Word[]) => {
    if (words.length > 0) {
      const unusedWords = words.filter(word => 
        !currentWord || word.id !== currentWord.id
      );
      
      if (unusedWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * unusedWords.length);
        const selectedWord = unusedWords[randomIndex];
        console.log('Selected word:', selectedWord);
        setCurrentWord(selectedWord);
        setUserAnswer('');
        setFeedback(null);
      } else if (words.length > 0) {
        const randomIndex = Math.floor(Math.random() * words.length);
        const selectedWord = words[randomIndex];
        console.log('Selected word:', selectedWord);
        setCurrentWord(selectedWord);
        setUserAnswer('');
        setFeedback(null);
      }
    }
  };

  const fetchNewWord = () => {
    selectNewWord(availableWords);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWord) {
      console.warn('No current word available');
      return;
    }

    if (!currentWord.id) {
      console.error('Current word has no ID:', currentWord);
      return;
    }

    console.log('Submitting answer for word:', currentWord);
    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.italian.toLowerCase();
    setFeedback(isCorrect ? 'Correct!' : `Incorrect. The answer was: ${currentWord.italian}`);
    
    // Update score and session stats
    const newScore = {
      correct: isCorrect ? score.correct + 1 : score.correct,
      total: score.total + 1
    };
    setScore(newScore);
    
    // Update Redux stats
    dispatch(updateSessionStats({ isCorrect }));
    console.log('Current quiz score:', newScore);
    console.log('Local storage stats:', localStorage.getItem('quizSessionStats'));

    // Update word statistics in Redux
    try {
      await dispatch(updateWordStats({ wordId: currentWord.id, isCorrect })).unwrap();
    } catch (error) {
      console.error('Error updating word stats:', error);
    }

    // Check if quiz is complete
    if (newScore.total >= wordCount) {
      console.log('Quiz complete, saving session:', newScore);
      dispatch(completeSession({ 
        correct: newScore.correct,
        total: newScore.total,
        groupId: groupId
      }));
      console.log('Final local storage stats:', localStorage.getItem('quizSessionStats'));
    }

    // Move to next word after a delay
    setTimeout(() => {
      if (newScore.total < wordCount) {
        fetchNewWord();
      }
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>No words available</p>
      </div>
    );
  }

  if (score.total >= wordCount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl">
            Your score: {score.correct} out of {score.total} ({Math.round((score.correct / score.total) * 100)}%)
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setScore({ correct: 0, total: 0 });
                dispatch(resetSessionStats());
                fetchNewWord();
              }}
            >
              Start New Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/study_activities/word-quiz')}
            >
              View Statistics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStats = currentWord && wordStats[currentWord.id] 
    ? wordStats[currentWord.id] 
    : { correct_count: 0, wrong_count: 0 };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translate to Italian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-3xl mb-6">{currentWord.english}</p>
          <div className="text-sm text-gray-500">
            Question {score.total + 1} of {wordCount}
          </div>
        </div>

        {feedback && (
          <div className={`text-center p-2 rounded ${
            feedback.startsWith('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {feedback}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type the Italian translation..."
            disabled={!!feedback || statsLoading}
            className="w-full"
          />
          
          {statsError && (
            <div className="p-4 rounded bg-red-100 text-red-800">
              Error updating stats: {statsError}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={fetchNewWord}
              disabled={!!feedback || statsLoading}
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={!!feedback || !userAnswer.trim() || statsLoading}
            >
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 