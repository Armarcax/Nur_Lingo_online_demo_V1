import { useState, type FormEvent } from "react";
import { z } from "zod";
import { NEWSLETTER_CONFIG } from "@/config/newsletter";
import { NewsletterSuccess } from "./NewsletterSuccess";
import { NewsletterError } from "./NewsletterError";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address." }).max(255);

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [submitted, setSubmitted] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? NEWSLETTER_CONFIG.errorMessage);
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(NEWSLETTER_CONFIG.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: parsed.data }),
      });
      if (!res.ok) throw new Error("subscribe_failed");
      // Cache locally too, so the list survives before a real provider is wired.
      try {
        const raw = localStorage.getItem(NEWSLETTER_CONFIG.storageKey);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(parsed.data)) list.push(parsed.data);
        localStorage.setItem(NEWSLETTER_CONFIG.storageKey, JSON.stringify(list));
      } catch {}
      setSubmitted(parsed.data);
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
      setError(NEWSLETTER_CONFIG.errorMessage);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-2">
      <div className={compact ? "flex gap-2" : "flex flex-col gap-2 sm:flex-row"}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={NEWSLETTER_CONFIG.placeholder}
          maxLength={255}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {status === "loading" ? "…" : NEWSLETTER_CONFIG.buttonText}
        </button>
      </div>
      {status === "success" && <NewsletterSuccess email={submitted} />}
      {status === "error" && <NewsletterError message={error || NEWSLETTER_CONFIG.errorMessage} />}
    </form>
  );
}


export default NewsletterForm;



