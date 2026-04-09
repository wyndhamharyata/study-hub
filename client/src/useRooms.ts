import { useState, useEffect } from "react";
import { ref, onValue, set, update, remove } from "firebase/database";
import { db } from "./firebase";

export interface Room {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: number;
  bannerUrl?: string;
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const roomsRef = ref(db, "studyhub/rooms");
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val() as Record<string, Room> | null;
      setRooms(
        data
          ? Object.values(data).sort((a, b) => b.createdAt - a.createdAt)
          : []
      );
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { rooms, loading };
}

export function createRoom(room: Room) {
  return set(ref(db, `studyhub/rooms/${room.id}`), room);
}

export function updateRoom(
  roomId: string,
  data: { name: string; description: string; bannerUrl?: string }
) {
  return update(ref(db, `studyhub/rooms/${roomId}`), data);
}

export async function deleteRoom(roomId: string) {
  await remove(ref(db, `studyhub/notes/${roomId}`));
  await remove(ref(db, `studyhub/flashcards/${roomId}`));
  await remove(ref(db, `studyhub/rooms/${roomId}`));
}
