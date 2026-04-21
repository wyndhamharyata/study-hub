import { useState } from "react";
import { signOut, sendEmailVerification, type User } from "firebase/auth";
import { auth } from "./firebase";

export default function EmailVerificationGate({ user }: { user: User }) {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResend() {
    setResending(true);
    setMessage("");
    try {
      await sendEmailVerification(user, {
        url: "https://studyhub.mwyndham.dev",
      });
      setMessage("Verification email sent! Check your inbox.");
    } catch (err: unknown) {
      setMessage(
        err instanceof Error ? err.message : "Failed to send verification email"
      );
    } finally {
      setResending(false);
    }
  }

  async function handleRefresh() {
    await user.reload();
    if (user.emailVerified) {
      window.location.reload();
    } else {
      setMessage("Email not yet verified. Please check your inbox.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-sm bg-base-100/90 backdrop-blur shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl">Verify Your Email</h2>
          <p className="mt-2">
            A verification email was sent to <strong>{user.email}</strong>.
            Please verify your email to continue.
          </p>
          {message && <p className="text-sm mt-2 text-info">{message}</p>}
          <div className="flex flex-col gap-2 mt-4 w-full">
            <button
              className="btn btn-primary w-full"
              onClick={handleRefresh}
            >
              I've Verified My Email
            </button>
            <button
              className="btn btn-outline w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending && (
                <span className="loading loading-spinner loading-sm" />
              )}
              Resend Verification Email
            </button>
            <button
              className="btn btn-ghost w-full"
              onClick={() => signOut(auth)}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
