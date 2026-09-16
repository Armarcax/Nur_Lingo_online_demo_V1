// src/lib/hooks/useToast.ts
"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@/hooks/useI18n";

export function useToast() {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "info">("info");
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((text: string, toastType: "success" | "error" | "info" = "info") => {
    setMessage(text);
    setType(toastType);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setMessage(""), 300);
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setMessage(""), 300);
  }, []);

  return { message, type, isVisible, showToast, hideToast };
}