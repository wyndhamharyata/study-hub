import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import type { User } from "firebase/auth";
import { useRooms, updateRoom, deleteRoom } from "./useRooms";
import { useNotes, createNote, updateNote, deleteNote } from "./useNotes";
import {
  useFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "./useFlashcards";
import { useUsers, getUserName } from "./useUsers";
import { ListIcon, GridIcon } from "./Icons";
import Markdown from "./Markdown";
import RoomFormModal from "./RoomFormModal";
import NoteFormModal from "./NoteFormModal";
import FlashcardFormModal from "./FlashcardFormModal";
import type { Note } from "./useNotes";
import type { Flashcard } from "./useFlashcards";

export default function RoomPage({ user }: { user: User }) {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
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
                <Markdown className="opacity-70 mt-1">{room.description}</Markdown>
              )}
              <p className="text-xs opacity-50 mt-2">
                Created by {getUserName(users, room.createdBy)} &middot; {new Date(room.createdAt).toLocaleDateString()}
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

        {/* Side menu + content layout */}
        <div className="flex flex-col md:flex-row">
          {/* Side menu */}
          <ul className="menu gap-1 md:w-56 md:min-h-[300px] menu-horizontal md:menu-vertical w-full border-b md:border-b-0 md:border-r border-base-200 p-4">
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

          {/* Content area */}
          <div className="flex-1 min-w-0 p-6 bg-base-200 shadow-inner rounded-br-box">
          {/* Notes section */}
          {tab === "notes" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="join">
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
                      className="card bg-base-100 shadow-sm"
                    >
                      <div className="card-body">
                        <h3 className="card-title text-base">{note.title}</h3>
                        <Markdown className={notesView === "grid" ? "line-clamp-4" : ""}>
                          {note.content}
                        </Markdown>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-50">
                            {getUserName(users, note.createdBy)} &middot; {new Date(note.updatedAt).toLocaleString()}
                          </span>
                          <div className="flex gap-1">
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
                <div className="join">
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
                <div
                  className={
                    cardsView === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {flashcards.map((card) => (
                    <div
                      key={card.id}
                      className={`card shadow-sm cursor-pointer transition-colors ${
                        flipped[card.id]
                          ? "bg-success/15"
                          : "bg-warning/15"
                      }`}
                      onClick={() =>
                        setFlipped((prev) => ({
                          ...prev,
                          [card.id]: !prev[card.id],
                        }))
                      }
                    >
                      <div className="card-body">
                        <div
                          className={`badge badge-sm mb-1 ${
                            flipped[card.id]
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {flipped[card.id] ? "Answer" : "Question"}
                        </div>
                        <p className="whitespace-pre-wrap">
                          {flipped[card.id] ? card.answer : card.question}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-50">
                            {getUserName(users, card.createdBy)} &middot; Click to {flipped[card.id] ? "show question" : "reveal answer"}
                          </span>
                          <div
                            className="flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => setEditingCard(card)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleDeleteCard(card.id)}
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
          </div>
        </div>
      </div>

      {/* Modals */}
      <RoomFormModal
        open={editRoom}
        onClose={() => setEditRoom(false)}
        onSubmit={handleEditRoom}
        initialValues={{ name: room.name, description: room.description }}
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
