"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null | undefined;

/** Cliente do navegador (singleton). `null` quando o Supabase não está configurado. */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (client !== undefined) return client;
  // Referências literais: o Next só embute NEXT_PUBLIC_* acessadas assim.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createBrowserClient<Database>(url, key) : null;
  return client;
}
