import { useState, useEffect, useRef } from "react";

interface FlashcardFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { question: string; answer: string }) => void;
  initialValues?: { question: string; answer: string };
  title: string;
}

export default function FlashcardFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: FlashcardFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setQuestion(initialValues?.question ?? "");
    setAnswer(initialValues?.answer ?? "");
  }, [open, initialValues]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) return;
    onSubmit({ question: question.trim(), answer: answer.trim() });
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="flex flex-col gap-3">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
          />
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
            {initialValues ? "Save" : "Add Flashcard"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
