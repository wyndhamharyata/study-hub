import { useState } from "react";
import { Link } from "react-router";
import type { User } from "firebase/auth";
import { useRooms, createRoom, updateRoom, deleteRoom } from "./useRooms";
import { useUsers, getUserName } from "./useUsers";
import RoomFormModal from "./RoomFormModal";

export default function DashboardPage({ user }: { user: User }) {
  const { rooms, loading } = useRooms();
  const { users } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  function handleCreate(data: { name: string; description: string }) {
    const id = crypto.randomUUID();
    createRoom({
      id,
      name: data.name,
      description: data.description,
      createdBy: user.uid,
      createdAt: Date.now(),
    });
    setModalOpen(false);
  }

  function handleEdit(data: { name: string; description: string }) {
    if (!editingRoom) return;
    updateRoom(editingRoom.id, {
      name: data.name,
      description: data.description,
    });
    setEditingRoom(null);
  }

  function handleDelete(roomId: string) {
    if (confirm("Delete this room and all its notes and flashcards?")) {
      deleteRoom(roomId);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Study Rooms</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setModalOpen(true)}
        >
          + New Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 opacity-60">
          <p className="text-lg">No study rooms yet.</p>
          <p className="text-sm mt-1">Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="card-body">
                <Link
                  to={`/rooms/${room.id}`}
                  className="card-title link link-hover"
                >
                  {room.name}
                </Link>
                {room.description && (
                  <p className="opacity-70 line-clamp-3">{room.description}</p>
                )}
                <div className="text-xs opacity-40 mt-3 border-t border-base-300 pt-2">
                  {getUserName(users, room.createdBy)} &middot; {new Date(room.createdAt).toLocaleDateString()}
                </div>
                {room.createdBy === user.uid && (
                  <div className="flex justify-end mt-2 gap-1">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() =>
                        setEditingRoom({
                          id: room.id,
                          name: room.name,
                          description: room.description,
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleDelete(room.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        title="Create Study Room"
      />

      <RoomFormModal
        open={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        onSubmit={handleEdit}
        initialValues={editingRoom ?? undefined}
        title="Edit Room"
      />
    </div>
  );
}
