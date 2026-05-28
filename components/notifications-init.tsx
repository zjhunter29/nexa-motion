"use client";

import { useEffect } from "react";
import { initNotifications } from "@/lib/notifications";

/** Tiny mount-only component that boots the notifications subsystem. */
export function NotificationsInit() {
  useEffect(() => {
    initNotifications().catch(() => {});
  }, []);
  return null;
}
