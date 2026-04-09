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
  order?: number;
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
          ? Object.values(data).sort(
              (a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt)
            )
          : []
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, [roomId]);

  return { flashcards, loading };
}

export function createFlashcard(roomId: string, card: Flashcard) {
  return set(ref(db, `studyhub/flashcards/${roomId}/${card.id}`), {
    ...card,
    order: card.order ?? card.createdAt,
  });
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

export function reorderFlashcards(
  roomId: string,
  updates: { id: string; order: number }[]
) {
  const batch: Record<string, number> = {};
  for (const { id, order } of updates) {
    batch[`studyhub/flashcards/${roomId}/${id}/order`] = order;
  }
  return update(ref(db), batch);
}
