import { useState, useEffect, useRef } from "react";
import { UploadIcon, XMarkIcon } from "./Icons";

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
  const [dragging, setDragging] = useState(false);

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

  function handleFile(file: File) {
    setBannerFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
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
      <div className="modal-box max-h-[85vh]">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="flex flex-col gap-3">
          {/* Banner drop zone */}
          <div
            className={`relative rounded-box border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
              dragging
                ? "border-primary bg-primary/5"
                : preview
                  ? "border-transparent"
                  : "border-base-300 hover:border-primary/50"
            }`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Banner preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    Click or drop to replace
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute top-2 right-2 btn btn-circle btn-xs bg-base-100/80 hover:bg-base-100 border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setBannerFile(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <XMarkIcon />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-base-content/50">
                <UploadIcon className="size-8 mb-2" />
                <span className="text-sm">Drop banner image or click to browse</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

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
            rows={6}
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
