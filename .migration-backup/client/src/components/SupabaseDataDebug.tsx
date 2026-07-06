"use client";

import { useEffect } from "react";

type DebugTable = {
  label: string;
  rows: unknown[];
};

declare global {
  interface Window {
    __localeBreezeSupabaseData?: Record<string, unknown>;
  }
}

type SupabaseDataDebugProps = {
  data: unknown;
  label: string;
  tables?: DebugTable[];
};

export default function SupabaseDataDebug({
  data,
  label,
  tables = [],
}: SupabaseDataDebugProps) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SUPABASE_DEBUG !== "true") {
      return;
    }

    // Keep a copy on window so you can inspect it from DevTools anytime.
    window.__localeBreezeSupabaseData = {
      ...window.__localeBreezeSupabaseData,
      [label]: data,
    };

    console.groupCollapsed(`[Locale Breeze] Supabase data: ${label}`);
    console.log("Full payload", data);
    tables.forEach(({ label: tableLabel, rows }) => {
      console.log(tableLabel);
      //console.table(rows);
    });
    console.log("Inspect with window.__localeBreezeSupabaseData");
    console.groupEnd();
  }, [data, label, tables]);

  return null;
}
