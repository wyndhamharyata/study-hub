import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { signOut } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "./firebase";
import { useAuth } from "./useAuth";
import EmailVerificationGate from "./EmailVerificationGate";
import DashboardPage from "./DashboardPage";

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
      <div className="navbar bg-base-100 px-6 border-b border-base-300">
        <div className="flex-1">
          <a href="/" className="text-2xl font-bold">StudyHub</a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-70">{user.email}</span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => signOut(auth)}
          >
            Sign Out
          </button>
        </div>
      </div>
      <Routes>
        <Route path="/rooms/:roomId" element={<div className="p-6">Room detail coming soon...</div>} />
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
