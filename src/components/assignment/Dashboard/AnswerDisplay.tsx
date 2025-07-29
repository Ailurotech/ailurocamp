import { Assignment } from '@/types/assignment';

interface AnswerDisplayProps {
  question: NonNullable<Assignment['questions']>[number];
  answer: string | string[] | null;
}

export default function AnswerDisplay({ question, answer }: AnswerDisplayProps) {
  if (!answer) {
    return <span className="text-gray-500">No answer provided</span>;
  }

  switch (question.type) {
    case 'multiple-choice':
    case 'true-false':
      return <span className="font-medium">{answer}</span>;

    case 'short-answer':
    case 'essay':
      return (
        <div className="bg-gray-50 p-3 rounded border">
          <pre className="whitespace-pre-wrap text-sm">{answer}</pre>
        </div>
      );

    case 'coding':
      return (
        <div className="bg-gray-50 p-3 rounded border">
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {answer}
          </pre>
        </div>
      );

    case 'file-upload':
      return (
        <div className="bg-blue-50 p-3 rounded border">
          <span className="text-blue-800 font-medium">📎 {answer}</span>
        </div>
      );

    default:
      return <span>{answer}</span>;
  }
}
