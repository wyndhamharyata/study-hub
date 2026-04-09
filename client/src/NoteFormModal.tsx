import { useState, useEffect, useRef } from "react";

interface NoteFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
  initialValues?: { title: string; content: string };
  title: string;
}

export default function NoteFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: NoteFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    setNoteTitle(initialValues?.title ?? "");
    setContent(initialValues?.content ?? "");
  }, [open, initialValues]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  const handleSubmit = () => {
    if (!noteTitle.trim()) return;
    onSubmit({ title: noteTitle.trim(), content: content.trim() });
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="flex flex-col gap-3">
          <input
            className="input input-bordered w-full"
            placeholder="Note title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Note content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
            {initialValues ? "Save" : "Add Note"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
