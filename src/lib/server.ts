
import { createClient } from "@/lib/supabase/server";

export async function serverDb() {
  return createClient();
}
