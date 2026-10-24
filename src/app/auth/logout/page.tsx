
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const [message, setMessage] = useState("Mengakhiri sesi...");

  useEffect(() => {
    async function logout() {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setMessage(`Gagal logout: ${error.message}`);
        return;
      }

      window.location.replace("/auth/login");
    }

    void logout();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFBF1]">
      <p className="font-semibold">{message}</p>
    </main>
  );
}
