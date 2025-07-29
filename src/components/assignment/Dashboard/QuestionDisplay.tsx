import { Assignment } from '@/types/assignment';
import AnswerDisplay from './AnswerDisplay';

interface QuestionDisplayProps {
  question: NonNullable<Assignment['questions']>[number];
  questionIndex: number;
  answer: string | string[] | null;
}

export default function QuestionDisplay({ 
  question, 
  questionIndex, 
  answer 
}: QuestionDisplayProps) {
  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Question {questionIndex + 1}
        </h3>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {question.points} pts
        </span>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {question.title}
        </p>
      </div>

      {/* 选择题选项展示 */}
      {question.type === 'multiple-choice' && question.options && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-600 mb-2">Options:</h4>
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <div
                key={`option-${optionIndex}`}
                className="flex items-center space-x-2"
              >
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-600 mb-2">
          Your Answer:
        </h4>
        <AnswerDisplay question={question} answer={answer} />
      </div>
    </div>
  );
}
