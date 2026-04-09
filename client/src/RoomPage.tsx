import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { signOut, type User } from "firebase/auth";
import { auth } from "./firebase";
import { useRooms, updateRoom, deleteRoom } from "./useRooms";
import { useNotes, createNote, updateNote, deleteNote } from "./useNotes";
import {
  useFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reorderFlashcards,
} from "./useFlashcards";
import { useUsers, getUserName } from "./useUsers";
import RoomFormModal from "./RoomFormModal";
import NoteFormModal from "./NoteFormModal";
import FlashcardFormModal from "./FlashcardFormModal";
import { ListIcon, GridIcon, PencilIcon, XMarkIcon } from "./Icons";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableFlashcard from "./SortableFlashcard";
import Markdown from "./Markdown";
import type { Note } from "./useNotes";
import type { Flashcard } from "./useFlashcards";

export default function RoomPage({ user }: { user: User }) {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const origin = (location.state as { originX?: number; originY?: number }) ?? {};
  const { rooms } = useRooms();
  const room = rooms.find((r) => r.id === roomId);
  const { users } = useUsers();

  const { notes, loading: notesLoading } = useNotes(roomId!);
  const { flashcards, loading: cardsLoading } = useFlashcards(roomId!);

  const [tab, setTab] = useState<"notes" | "flashcards">("notes");
  const [notesView, setNotesView] = useState<"list" | "grid">("list");
  const [cardsView, setCardsView] = useState<"list" | "grid">("grid");
  const [editRoom, setEditRoom] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [cardModal, setCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [showDesc, setShowDesc] = useState(false);
  const descModalRef = useRef<HTMLDialogElement>(null);
  const viewNoteRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = descModalRef.current;
    if (!el) return;
    if (showDesc) el.showModal();
    else el.close();
  }, [showDesc]);

  useEffect(() => {
    const el = viewNoteRef.current;
    if (!el) return;
    if (viewingNote) el.showModal();
    else el.close();
  }, [viewingNote]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = flashcards.findIndex((c) => c.id === active.id);
    const newIndex = flashcards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...flashcards];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updates = reordered.map((card, i) => ({ id: card.id, order: i }));
    reorderFlashcards(roomId!, updates);
  }

  const isOwner = room?.createdBy === user.uid;

  async function handleEditRoom(data: {
    name: string;
    description: string;
    bannerFile?: File;
  }) {
    let bannerUrl = room?.bannerUrl;
    if (data.bannerFile) {
      const formData = new FormData();
      formData.append("file", data.bannerFile);
      try {
        const res = await fetch(`/api/rooms/${roomId}/banner`, {
          method: "POST",
          body: formData,
        });
        const json = (await res.json()) as { url?: string };
        if (json.url) bannerUrl = json.url;
      } catch {
        // keep existing banner
      }
    }
    updateRoom(roomId!, {
      name: data.name,
      description: data.description,
      ...(bannerUrl ? { bannerUrl } : {}),
    });
    setEditRoom(false);
  }

  function handleDeleteRoom() {
    if (confirm("Delete this room and all its contents?")) {
      deleteRoom(roomId!);
      navigate("/");
    }
  }

  // Notes handlers
  function handleCreateNote(data: { title: string; content: string }) {
    const id = crypto.randomUUID();
    createNote(roomId!, {
      id,
      title: data.title,
      content: data.content,
      createdBy: user.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setNoteModal(false);
  }

  function handleEditNote(data: { title: string; content: string }) {
    if (!editingNote) return;
    updateNote(roomId!, editingNote.id, data);
    setEditingNote(null);
  }

  function handleDeleteNote(noteId: string) {
    if (confirm("Delete this note?")) {
      deleteNote(roomId!, noteId);
    }
  }

  // Flashcard handlers
  function handleCreateCard(data: { question: string; answer: string }) {
    const id = crypto.randomUUID();
    createFlashcard(roomId!, {
      id,
      question: data.question,
      answer: data.answer,
      createdBy: user.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setCardModal(false);
  }

  function handleEditCard(data: { question: string; answer: string }) {
    if (!editingCard) return;
    updateFlashcard(roomId!, editingCard.id, data);
    setEditingCard(null);
  }

  function handleDeleteCard(cardId: string) {
    if (confirm("Delete this flashcard?")) {
      deleteFlashcard(roomId!, cardId);
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
      {/* Desktop floating profile */}
      <div className="hidden md:flex fixed top-3 right-6 z-50 items-center gap-2 bg-base-100 rounded-box shadow-sm px-3 py-1.5">
        <span className="text-xs opacity-70">{user.email}</span>
        <button
          className="btn btn-outline btn-xs"
          onClick={() => signOut(auth)}
        >
          Sign Out
        </button>
      </div>

      <button
        className="btn btn-ghost btn-sm mb-4"
        onClick={() => navigate("/")}
      >
        &larr; Back
      </button>

      <div
        className="card bg-base-100 shadow-md overflow-hidden animate-card-expand"
        ref={(el) => {
          if (el && origin.originX != null && origin.originY != null) {
            const rect = el.getBoundingClientRect();
            const ox = origin.originX - rect.left;
            const oy = origin.originY - rect.top;
            el.style.transformOrigin = `${ox}px ${oy}px`;
          }
        }}
      >
        {/* Banner */}
        {room.bannerUrl && (
          <img
            src={room.bannerUrl}
            alt={`${room.name} banner`}
            className="w-full h-48 object-cover"
          />
        )}

        {/* Room header — mobile only */}
        <div className="md:hidden px-6 pt-6 pb-4 border-b border-base-200">
          <h2 className="text-2xl font-bold">{room.name}</h2>
          {room.description && (
            <div className="mt-1">
              <Markdown className="opacity-70 line-clamp-3">{room.description}</Markdown>
              <button
                className="btn btn-link btn-xs px-0 mt-1"
                onClick={() => setShowDesc(true)}
              >
                Read more
              </button>
            </div>
          )}
          <p className="text-xs opacity-50 mt-2">
            Created by {getUserName(users, room.createdBy)} &middot; {new Date(room.createdAt).toLocaleDateString()}
          </p>
          {isOwner && (
            <div className="flex gap-2 mt-3">
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => setEditRoom(true)}
              >
                Edit
              </button>
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={handleDeleteRoom}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Sidebar + content layout */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar: room info (desktop) + section menu */}
          <div className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-base-200">
            {/* Room info — desktop only */}
            <div className="hidden md:block p-4 pb-3">
              <h2 className="text-xl font-bold">{room.name}</h2>
              {room.description && (
                <div className="max-h-[40vh] overflow-y-auto mt-1">
                  <Markdown className="opacity-70">{room.description}</Markdown>
                </div>
              )}
              <p className="text-xs opacity-50 mt-2">
                Created by {getUserName(users, room.createdBy)} &middot; {new Date(room.createdAt).toLocaleDateString()}
              </p>
              {isOwner && (
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setEditRoom(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={handleDeleteRoom}
                  >
                    Delete
                  </button>
                </div>
              )}
              <div className="divider my-2"></div>
            </div>

            {/* Section menu */}
            <ul className="menu gap-1 menu-horizontal md:menu-vertical w-full p-4 md:pt-0">
              <li className="menu-title hidden md:block">Sections</li>
              <li>
                <button
                  className={`rounded-sm ${tab === "notes" ? "bg-accent/15 font-semibold" : ""}`}
                  onClick={() => setTab("notes")}
                >
                  Notes
                  <span className="badge badge-sm">{notes.length}</span>
                </button>
              </li>
              <li>
                <button
                  className={`rounded-sm ${tab === "flashcards" ? "bg-accent/15 font-semibold" : ""}`}
                  onClick={() => setTab("flashcards")}
                >
                  Flashcards
                  <span className="badge badge-sm">{flashcards.length}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0 p-6 bg-base-200 shadow-inner rounded-br-box">
          {/* Notes section */}
          {tab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="join hidden md:flex">
                  <button
                    className={`join-item btn btn-sm ${notesView === "list" ? "btn-primary" : ""}`}
                    onClick={() => setNotesView("list")}
                    title="List view"
                  >
                    <ListIcon />
                  </button>
                  <button
                    className={`join-item btn btn-sm ${notesView === "grid" ? "btn-primary" : ""}`}
                    onClick={() => setNotesView("grid")}
                    title="Grid view"
                  >
                    <GridIcon />
                  </button>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setNoteModal(true)}
                >
                  + Add Note
                </button>
              </div>

              {notesLoading ? (
                <div className="flex justify-center p-8">
                  <span className="loading loading-spinner" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-center opacity-60 py-8">No notes yet.</p>
              ) : (
                <div
                  className={
                    notesView === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setViewingNote(note)}
                    >
                      <div className="card-body">
                        <h3 className="card-title text-base">{note.title}</h3>
                        <Markdown className="line-clamp-4">
                          {note.content}
                        </Markdown>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-50">
                            {getUserName(users, note.createdBy)} &middot; {new Date(note.updatedAt).toLocaleString()}
                          </span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => setEditingNote(note)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Flashcards section */}
          {tab === "flashcards" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="join hidden md:flex">
                  <button
                    className={`join-item btn btn-sm ${cardsView === "list" ? "btn-primary" : ""}`}
                    onClick={() => setCardsView("list")}
                    title="List view"
                  >
                    <ListIcon />
                  </button>
                  <button
                    className={`join-item btn btn-sm ${cardsView === "grid" ? "btn-primary" : ""}`}
                    onClick={() => setCardsView("grid")}
                    title="Grid view"
                  >
                    <GridIcon />
                  </button>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setCardModal(true)}
                >
                  + Add Flashcard
                </button>
              </div>

              {cardsLoading ? (
                <div className="flex justify-center p-8">
                  <span className="loading loading-spinner" />
                </div>
              ) : flashcards.length === 0 ? (
                <p className="text-center opacity-60 py-8">No flashcards yet.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={flashcards.map((c) => c.id)}
                    strategy={
                      cardsView === "grid"
                        ? rectSortingStrategy
                        : verticalListSortingStrategy
                    }
                  >
                    <div
                      className={
                        cardsView === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                          : "flex flex-col gap-4"
                      }
                    >
                      {flashcards.map((card) => (
                        <SortableFlashcard
                          key={card.id}
                          card={card}
                          flipped={!!flipped[card.id]}
                          onFlip={() =>
                            setFlipped((prev) => ({
                              ...prev,
                              [card.id]: !prev[card.id],
                            }))
                          }
                          creatorName={getUserName(users, card.createdBy)}
                          onEdit={() => setEditingCard(card)}
                          onDelete={() => handleDeleteCard(card.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Description modal — mobile */}
      <dialog ref={descModalRef} className="modal modal-bottom md:modal-middle bottom-sheet" onClose={() => setShowDesc(false)}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-3">{room.name}</h3>
          {room.description && <Markdown>{room.description}</Markdown>}
          <div className="modal-action">
            <button className="btn btn-sm" onClick={() => setShowDesc(false)}>Close</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Note detail modal */}
      <dialog ref={viewNoteRef} className="modal modal-bottom md:modal-middle bottom-sheet" onClose={() => setViewingNote(null)}>
        {viewingNote && (
          <div className="modal-box md:max-w-4xl max-h-[85vh] flex flex-col md:flex-row gap-4">
            <div className="flex-1 overflow-y-auto min-w-0">
              <h3 className="font-bold text-lg mb-1">{viewingNote.title}</h3>
              <p className="text-xs opacity-50 mb-4">
                {getUserName(users, viewingNote.createdBy)} &middot; {new Date(viewingNote.updatedAt).toLocaleString()}
              </p>
              <Markdown>{viewingNote.content}</Markdown>
            </div>
            <div className="flex flex-row md:flex-col gap-2 md:border-l border-t md:border-t-0 border-base-200 pt-3 md:pt-0 md:pl-4 shrink-0">
              <button
                className="btn btn-outline btn-primary btn-sm flex-1 md:flex-none"
                onClick={() => {
                  setEditingNote(viewingNote);
                  setViewingNote(null);
                }}
              >
                <PencilIcon /> Edit
              </button>
              <button className="btn btn-ghost btn-sm flex-1 md:flex-none" onClick={() => setViewingNote(null)}>
                <XMarkIcon /> Close
              </button>
            </div>
          </div>
        )}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Modals */}
      <RoomFormModal
        open={editRoom}
        onClose={() => setEditRoom(false)}
        onSubmit={handleEditRoom}
        initialValues={{ name: room.name, description: room.description, bannerUrl: room.bannerUrl }}
        title="Edit Room"
      />
      <NoteFormModal
        open={noteModal}
        onClose={() => setNoteModal(false)}
        onSubmit={handleCreateNote}
        title="Add Note"
      />
      <NoteFormModal
        open={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSubmit={handleEditNote}
        initialValues={
          editingNote
            ? { title: editingNote.title, content: editingNote.content }
            : undefined
        }
        title="Edit Note"
      />
      <FlashcardFormModal
        open={cardModal}
        onClose={() => setCardModal(false)}
        onSubmit={handleCreateCard}
        title="Add Flashcard"
      />
      <FlashcardFormModal
        open={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSubmit={handleEditCard}
        initialValues={
          editingCard
            ? { question: editingCard.question, answer: editingCard.answer }
            : undefined
        }
        title="Edit Flashcard"
      />
    </div>
  );
}
