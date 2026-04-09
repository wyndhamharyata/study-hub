import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

export interface StudyHubUser {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

export function useUsers() {
  const [users, setUsers] = useState<Record<string, StudyHubUser>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, "studyhub/users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() as Record<string, StudyHubUser> | null;
      setUsers(data ?? {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { users, loading };
}

export function getUserName(users: Record<string, StudyHubUser>, uid: string): string {
  const user = users[uid];
  return user?.name || user?.email || "Unknown";
}
