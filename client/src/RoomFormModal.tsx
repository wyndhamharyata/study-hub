import { useState, useEffect, useRef } from "react";

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
  }) => void;
  initialValues?: { name: string; description: string };
  title: string;
}

export default function RoomFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: RoomFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setDescription(initialValues?.description ?? "");
  }, [open, initialValues]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
    });
  };

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="flex flex-col gap-3">
          <input
            className="input input-bordered w-full"
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
            {initialValues ? "Save" : "Create"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
