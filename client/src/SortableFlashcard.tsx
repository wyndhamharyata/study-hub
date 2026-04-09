import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Flashcard } from "./useFlashcards";
import { GripIcon } from "./Icons";

interface SortableFlashcardProps {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
  creatorName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SortableFlashcard({
  card,
  flipped,
  onFlip,
  creatorName,
  onEdit,
  onDelete,
}: SortableFlashcardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card shadow-sm cursor-pointer transition-colors select-none ${
        flipped ? "bg-success/15" : "bg-warning/15"
      }`}
      onClick={onFlip}
    >
      <div className="card-body">
        <div className="flex items-start gap-2">
          <button
            className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-70 mt-1 touch-none"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripIcon />
          </button>
          <div className="flex-1 min-w-0">
            <div
              className={`badge badge-sm mb-1 ${
                flipped ? "badge-success" : "badge-warning"
              }`}
            >
              {flipped ? "Answer" : "Question"}
            </div>
            <p className="whitespace-pre-wrap">
              {flipped ? card.answer : card.question}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs opacity-50">
                {creatorName} &middot; Click to{" "}
                {flipped ? "show question" : "reveal answer"}
              </span>
              <div
                className="flex gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="btn btn-ghost btn-xs" onClick={onEdit}>
                  Edit
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  onClick={onDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
