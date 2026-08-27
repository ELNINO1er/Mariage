"use client";

import { useEffect } from "react";

export function OpenTracker({ token }: { token: string }) {
  useEffect(() => {
    void fetch(`/api/invitations/${encodeURIComponent(token)}/open`, { method: "POST", keepalive: true });
  }, [token]);
  return null;
}
