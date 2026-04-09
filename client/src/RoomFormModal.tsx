import { useState, useEffect, useRef } from "react";

interface RoomFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    bannerFile?: File;
  }) => void;
  initialValues?: { name: string; description: string; bannerUrl?: string };
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setDescription(initialValues?.description ?? "");
    setBannerFile(null);
    setPreview(initialValues?.bannerUrl ?? null);
    if (fileRef.current) fileRef.current.value = "";
  }, [open, initialValues]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setBannerFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      bannerFile: bannerFile ?? undefined,
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
            placeholder="Description (supports **markdown**)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Banner image (optional)</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={handleFileChange}
            />
          </label>
          {preview && (
            <img
              src={preview}
              alt="Banner preview"
              className="rounded-box h-32 w-full object-cover"
            />
          )}
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
