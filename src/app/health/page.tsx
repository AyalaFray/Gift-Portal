"use client";

import { useEffect, useState } from "react";

export default function HealthPage() {
  const [status, setStatus] = useState("בודק חיבור...");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/health");
      const json = await res.json();

      if (!json.ok) {
        setStatus(`שגיאה: ${json.error}`);
        return;
      }

      setStatus(`חיבור תקין ✅ (קיבלתי ${json.count} רשומות)`);
    })();
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Health Check</h1>
      <p style={{ marginTop: 12 }}>{status}</p>
    </div>
  );
}
