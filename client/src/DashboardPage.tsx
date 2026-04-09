import { useState } from "react";
import { useNavigate } from "react-router";
import { signOut, type User } from "firebase/auth";
import { auth } from "./firebase";
import { useRooms, createRoom, updateRoom, deleteRoom } from "./useRooms";
import { useUsers, getUserName } from "./useUsers";
import Markdown from "./Markdown";
import RoomFormModal from "./RoomFormModal";

async function uploadBanner(
  roomId: string,
  file: File
): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`/api/rooms/${roomId}/banner`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

export default function DashboardPage({ user }: { user: User }) {
  const navigate = useNavigate();
  const { rooms, loading } = useRooms();
  const { users } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{
    id: string;
    name: string;
    description: string;
    bannerUrl?: string;
  } | null>(null);

  async function handleCreate(data: {
    name: string;
    description: string;
    bannerFile?: File;
  }) {
    const id = crypto.randomUUID();
    let bannerUrl: string | undefined;
    if (data.bannerFile) {
      bannerUrl = (await uploadBanner(id, data.bannerFile)) ?? undefined;
    }
    createRoom({
      id,
      name: data.name,
      description: data.description,
      createdBy: user.uid,
      createdAt: Date.now(),
      bannerUrl,
    });
    setModalOpen(false);
  }

  async function handleEdit(data: {
    name: string;
    description: string;
    bannerFile?: File;
  }) {
    if (!editingRoom) return;
    let bannerUrl = editingRoom.bannerUrl;
    if (data.bannerFile) {
      bannerUrl =
        (await uploadBanner(editingRoom.id, data.bannerFile)) ?? bannerUrl;
    }
    updateRoom(editingRoom.id, {
      name: data.name,
      description: data.description,
      ...(bannerUrl ? { bannerUrl } : {}),
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
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold shrink-0">StudyHub</h2>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs opacity-70">{user.email}</span>
          <button
            className="hidden md:inline-flex btn btn-outline btn-xs"
            onClick={() => signOut(auth)}
          >
            Sign Out
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setModalOpen(true)}
          >
            + New Room
          </button>
        </div>
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
              className="card shadow-md overflow-hidden relative cursor-pointer hover:shadow-lg transition-shadow"
              style={
                room.bannerUrl
                  ? { backgroundImage: `url(${room.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : undefined
              }
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                navigate(`/rooms/${room.id}`, {
                  state: {
                    originX: rect.left + rect.width / 2,
                    originY: rect.top + rect.height / 2,
                  },
                });
              }}
            >
              <div className={`card-body ${room.bannerUrl ? "" : "bg-base-100"}`}>
                <h3 className={`card-title ${room.bannerUrl ? "text-white drop-shadow-md" : ""}`}>
                  {room.name}
                </h3>
                <div className={room.bannerUrl ? "bg-base-100/80 backdrop-blur-sm rounded-box p-3 -mx-1" : ""}>
                  {room.description && (
                    <Markdown className="opacity-70 line-clamp-3">
                      {room.description}
                    </Markdown>
                  )}
                  <div className="text-xs opacity-40 mt-3 border-t border-base-300 pt-2">
                    {getUserName(users, room.createdBy)} &middot;{" "}
                    {new Date(room.createdAt).toLocaleDateString()}
                  </div>
                  {room.createdBy === user.uid && (
                    <div className="flex justify-end mt-2 gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() =>
                          setEditingRoom({
                            id: room.id,
                            name: room.name,
                            description: room.description,
                            bannerUrl: room.bannerUrl,
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
