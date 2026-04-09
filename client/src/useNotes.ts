import { useState, useEffect } from "react";
import { ref, onValue, set, update, remove } from "firebase/database";
import { db } from "./firebase";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export function useNotes(roomId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const notesRef = ref(db, `studyhub/notes/${roomId}`);
    const unsubscribe = onValue(notesRef, (snapshot) => {
      const data = snapshot.val() as Record<string, Note> | null;
      setNotes(
        data
          ? Object.values(data).sort((a, b) => b.createdAt - a.createdAt)
          : []
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, [roomId]);

  return { notes, loading };
}

export function createNote(roomId: string, note: Note) {
  return set(ref(db, `studyhub/notes/${roomId}/${note.id}`), note);
}

export function updateNote(
  roomId: string,
  noteId: string,
  data: { title: string; content: string }
) {
  return update(ref(db, `studyhub/notes/${roomId}/${noteId}`), {
    ...data,
    updatedAt: Date.now(),
  });
}

export function deleteNote(roomId: string, noteId: string) {
  return remove(ref(db, `studyhub/notes/${roomId}/${noteId}`));
}
