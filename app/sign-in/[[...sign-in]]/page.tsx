import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="app-shell" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <SignIn />
    </main>
  );
}

