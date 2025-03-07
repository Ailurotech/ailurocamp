import KanbanBoard from '@/components/board/KanbanBoard';

export default function BoardPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Agile Board</h1>
      <KanbanBoard />
    </div>
  );
}
