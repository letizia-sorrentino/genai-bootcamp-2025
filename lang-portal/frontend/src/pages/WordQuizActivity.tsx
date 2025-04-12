import { useParams } from 'react-router-dom';
import WordQuiz from '@/components/WordQuiz';

export default function WordQuizActivity() {
  const { groupId } = useParams<{ groupId: string }>();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Word Quiz</h1>
      <WordQuiz 
        groupId={groupId ? parseInt(groupId) : undefined}
        wordCount={10}
      />
    </div>
  );
} 