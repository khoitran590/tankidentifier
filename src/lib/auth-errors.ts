export function getAuthErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") {
    return "Something went wrong. Please try again.";
  }

  const code = "code" in err ? String((err as { code: string }).code) : "";
  const message = "message" in err ? String((err as { message: string }).message) : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try logging in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "permission-denied":
      return "Permission denied. Publish Firestore rules (users + tanks) and Storage rules from this repo — see docs/FIREBASE.md.";
    case "storage/unauthorized":
      return "Could not upload the image. Publish Storage rules in Firebase Console (see storage.rules).";
    case "unavailable":
      return "Firestore is unavailable. Check that a Firestore database is created for this project.";
    case "failed-precondition":
      return "Firestore is not set up yet. Create a database in Firebase Console → Firestore.";
    default:
      if (message.includes("Firestore") || message.includes("permission")) {
        return `Firestore error: ${message}`;
      }
      if (message) return message;
      return "Something went wrong. Please try again.";
  }
}
