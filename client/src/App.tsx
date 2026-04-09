import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { signOut } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "./firebase";
import { useAuth } from "./useAuth";
import EmailVerificationGate from "./EmailVerificationGate";
import DashboardPage from "./DashboardPage";
import RoomPage from "./RoomPage";

const LoginPage = lazy(() => import("./LoginPage"));
const HomePage = lazy(() => import("./HomePage"));

function AuthShell() {
  const { user, loading } = useAuth();

  // Sync user record to studyhub/users on login (handles users from CloudComp)
  useEffect(() => {
    if (user?.emailVerified) {
      get(ref(db, `studyhub/users/${user.uid}`)).then((snapshot) => {
        if (!snapshot.exists()) {
          set(ref(db, `studyhub/users/${user.uid}`), {
            id: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "User",
            email: user.email,
            verified: true,
          });
        }
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) {
    return <HomePage />;
  }

  if (!user.emailVerified) {
    return <EmailVerificationGate user={user} />;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Mobile navbar */}
      <div className="md:hidden navbar bg-base-100 px-4 border-b border-base-300 gap-2 min-h-0 py-2">
        <div className="flex-1 min-w-0">
          <a href="/" className="text-lg font-bold shrink-0">Study Room</a>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs opacity-70 truncate max-w-[120px]">{user.email}</span>
          <button
            className="btn btn-outline btn-xs"
            onClick={() => signOut(auth)}
          >
            Sign Out
          </button>
        </div>
      </div>

      <Routes>
        <Route path="/rooms/:roomId" element={<RoomPage user={user} />} />
        <Route path="*" element={<DashboardPage user={user} />} />
      </Routes>
    </div>
  );
}

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <span className="loading loading-spinner loading-lg" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<AuthShell />} />
      </Routes>
    </Suspense>
  );
}
