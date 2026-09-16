// src/config/newsletter.ts

export const NEWSLETTER_CONFIG = {
  endpoint: "/api/newsletter/subscribe",
  successMessage: "Thank you for subscribing!",
  successMessageHy: "Շնորհակալություն բաժանորդագրվելու համար!",
  successMessageRu: "Спасибо за подписку!",
  errorMessage: "Something went wrong. Please try again.",
  errorMessageHy: "Ինչ-որ սխալ տեղի ունեցավ։ Փորձեք կրկին։",
  errorMessageRu: "Что-то пошло не так. Попробуйте снова.",
  placeholder: "Enter your email address...",
  placeholderHy: "Մուտքագրեք ձեր էլ. հասցեն...",
  placeholderRu: "Введите ваш email...",
  buttonText: "Subscribe",
  buttonTextHy: "Բաժանորդագրվել",
  buttonTextRu: "Подписаться",
  storageKey: "nur_newsletter_subscribers_v1",
  // Additional settings
  maxSubscribers: 10000,
  requireConfirmation: false,
  confirmationEmail: {
    subject: "Confirm your subscription",
    subjectHy: "Հաստատեք ձեր բաժանորդագրությունը",
    subjectRu: "Подтвердите подписку",
    body: "Please confirm your email address to complete your subscription.",
    bodyHy: "Խնդրում ենք հաստատել ձեր էլ. հասցեն՝ բաժանորդագրությունն ավարտելու համար։",
    bodyRu: "Пожалуйста, подтвердите ваш email для завершения подписки.",
  },
} as const;

export type NewsletterConfig = typeof NEWSLETTER_CONFIG;

// ─── HELPERS ─────────────────────────────────────────────────────────

/**
 * Get localized config based on language
 */
export function getLocalizedNewsletterConfig(lang: "en" | "hy" | "ru" = "en") {
  return {
    successMessage: lang === "hy" 
      ? NEWSLETTER_CONFIG.successMessageHy 
      : lang === "ru" 
        ? NEWSLETTER_CONFIG.successMessageRu 
        : NEWSLETTER_CONFIG.successMessage,
    errorMessage: lang === "hy" 
      ? NEWSLETTER_CONFIG.errorMessageHy 
      : lang === "ru" 
        ? NEWSLETTER_CONFIG.errorMessageRu 
        : NEWSLETTER_CONFIG.errorMessage,
    placeholder: lang === "hy" 
      ? NEWSLETTER_CONFIG.placeholderHy 
      : lang === "ru" 
        ? NEWSLETTER_CONFIG.placeholderRu 
        : NEWSLETTER_CONFIG.placeholder,
    buttonText: lang === "hy" 
      ? NEWSLETTER_CONFIG.buttonTextHy 
      : lang === "ru" 
        ? NEWSLETTER_CONFIG.buttonTextRu 
        : NEWSLETTER_CONFIG.buttonText,
  };
}

// ─── NEWSLETTER SUBSCRIBER TRACKING ────────────────────────────────

export interface Subscriber {
  email: string;
  subscribedAt: string;
  source?: string;
  lang?: "en" | "hy" | "ru";
  confirmed: boolean;
}

/**
 * Save subscriber to localStorage
 */
export function saveSubscriber(subscriber: Omit<Subscriber, "subscribedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSubscribers();
    const newSubscriber: Subscriber = {
      ...subscriber,
      subscribedAt: new Date().toISOString(),
    };
    // Check if already exists
    const exists = existing.some(s => s.email === subscriber.email);
    if (exists) return;
    existing.push(newSubscriber);
    localStorage.setItem(NEWSLETTER_CONFIG.storageKey, JSON.stringify(existing));
  } catch (error) {
    console.warn("[Newsletter] Failed to save subscriber:", error);
  }
}

/**
 * Get all subscribers from localStorage
 */
export function getSubscribers(): Subscriber[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(NEWSLETTER_CONFIG.storageKey);
    if (!data) return [];
    return JSON.parse(data) as Subscriber[];
  } catch (error) {
    console.warn("[Newsletter] Failed to get subscribers:", error);
    return [];
  }
}

/**
 * Get subscriber count
 */
export function getSubscriberCount(): number {
  return getSubscribers().length;
}

/**
 * Check if email is already subscribed
 */
export function isSubscribed(email: string): boolean {
  const subscribers = getSubscribers();
  return subscribers.some(s => s.email.toLowerCase() === email.toLowerCase());
}

/**
 * Get subscribers by language
 */
export function getSubscribersByLang(lang: "en" | "hy" | "ru"): Subscriber[] {
  return getSubscribers().filter(s => s.lang === lang);
}

/**
 * Get recent subscribers (by date)
 */
export function getRecentSubscribers(limit: number = 10): Subscriber[] {
  const subscribers = getSubscribers();
  return subscribers
    .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())
    .slice(0, limit);
}

/**
 * Clear all subscribers (admin only)
 */
export function clearSubscribers(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NEWSLETTER_CONFIG.storageKey);
  } catch (error) {
    console.warn("[Newsletter] Failed to clear subscribers:", error);
  }
}