import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import type { User } from "firebase/auth";
import { useRooms, updateRoom, deleteRoom } from "./useRooms";
import RoomFormModal from "./RoomFormModal";

export default function RoomPage({ user }: { user: User }) {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { rooms } = useRooms();
  const room = rooms.find((r) => r.id === roomId);

  const [tab, setTab] = useState<"notes" | "flashcards">("notes");
  const [editRoom, setEditRoom] = useState(false);

  const isOwner = room?.createdBy === user.uid;

  function handleEditRoom(data: { name: string; description: string }) {
    updateRoom(roomId!, {
      name: data.name,
      description: data.description,
    });
    setEditRoom(false);
  }

  function handleDeleteRoom() {
    if (confirm("Delete this room and all its contents?")) {
      deleteRoom(roomId!);
      navigate("/");
    }
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center opacity-60">Room not found.</p>
        <div className="text-center mt-4">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        className="btn btn-ghost btn-sm mb-4"
        onClick={() => navigate("/")}
      >
        &larr; Back
      </button>

      <div className="card bg-base-100 shadow-md overflow-hidden">
        {/* Room header */}
        <div className="px-6 pt-6 pb-4 border-b border-base-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{room.name}</h2>
              {room.description && (
                <p className="opacity-70 mt-1">{room.description}</p>
              )}
              <p className="text-xs opacity-50 mt-2">
                Created {new Date(room.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditRoom(true)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm text-error"
                  onClick={handleDeleteRoom}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <div role="tablist" className="tabs tabs-bordered mb-6">
            <button
              role="tab"
              className={`tab ${tab === "notes" ? "tab-active" : ""}`}
              onClick={() => setTab("notes")}
            >
              Notes
            </button>
            <button
              role="tab"
              className={`tab ${tab === "flashcards" ? "tab-active" : ""}`}
              onClick={() => setTab("flashcards")}
            >
              Flashcards
            </button>
          </div>

          {tab === "notes" && (
            <p className="text-center opacity-60 py-8">Notes coming soon...</p>
          )}

          {tab === "flashcards" && (
            <p className="text-center opacity-60 py-8">Flashcards coming soon...</p>
          )}
        </div>
      </div>

      {/* Edit room modal */}
      <RoomFormModal
        open={editRoom}
        onClose={() => setEditRoom(false)}
        onSubmit={handleEditRoom}
        initialValues={{ name: room.name, description: room.description }}
        title="Edit Room"
      />
    </div>
  );
}
