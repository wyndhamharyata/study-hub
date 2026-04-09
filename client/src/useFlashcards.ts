import { useState, useEffect } from "react";
import { ref, onValue, set, update, remove } from "firebase/database";
import { db } from "./firebase";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export function useFlashcards(roomId: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const cardsRef = ref(db, `studyhub/flashcards/${roomId}`);
    const unsubscribe = onValue(cardsRef, (snapshot) => {
      const data = snapshot.val() as Record<string, Flashcard> | null;
      setFlashcards(
        data
          ? Object.values(data).sort((a, b) => b.createdAt - a.createdAt)
          : []
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, [roomId]);

  return { flashcards, loading };
}

export function createFlashcard(roomId: string, card: Flashcard) {
  return set(ref(db, `studyhub/flashcards/${roomId}/${card.id}`), card);
}

export function updateFlashcard(
  roomId: string,
  cardId: string,
  data: { question: string; answer: string }
) {
  return update(ref(db, `studyhub/flashcards/${roomId}/${cardId}`), {
    ...data,
    updatedAt: Date.now(),
  });
}

export function deleteFlashcard(roomId: string, cardId: string) {
  return remove(ref(db, `studyhub/flashcards/${roomId}/${cardId}`));
}
