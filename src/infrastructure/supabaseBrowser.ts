import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dauglhucpflemfdsygzr.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Tzx9LXMBdEISAmFjCCVCzA_32eSYnNX";

  if (!url || !key) {
    console.warn("[SellTime Realtime] Supabase URL hoặc Anon Key chưa được thiết lập");
    return null;
  }

  try {
    browserClient = createClient(url, key, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return browserClient;
  } catch (err) {
    console.warn("[SellTime Realtime] Không thể khởi tạo Supabase client:", err);
    return null;
  }
}
