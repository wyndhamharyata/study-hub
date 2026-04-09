import { Link } from "react-router";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <div className="navbar bg-base-100 px-6 border-b border-base-300">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">StudyHub</h1>
        </div>
        <Link to="/login" className="btn btn-primary btn-sm">
          Sign In
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h2 className="text-4xl font-bold mb-4">Study Together, Learn Better</h2>
          <p className="text-lg opacity-70 mb-8">
            Create study rooms, share notes, and practice with flashcards.
            Real-time collaboration powered by Firebase.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
