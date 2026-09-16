// src/config/social.ts

/**
 * NUR Lingo — Social media configuration.
 * Update these URLs in one place to change every reference across the app.
 */

export const SOCIAL_LINKS = {
  email: "contact@nurlingo.com",
  instagram: "https://instagram.com/nurlingo",
  facebook: "https://facebook.com/nurlingo",
  youtube: "https://youtube.com/@nurlingo",
  tiktok: "https://tiktok.com/@nurlingo",
  twitter: "https://twitter.com/nurlingo",
  linkedin: "https://linkedin.com/company/nurlingo",
  telegram: "https://t.me/nurlingo",
  spotify: "https://spotify.com/artist/nurlingo",
  website: "https://nurlingo.com",
  github: "https://github.com/nurlingo",
  discord: "https://discord.gg/nurlingo",
} as const;

export type SocialKey = keyof typeof SOCIAL_LINKS;

export interface SocialItem {
  key: SocialKey;
  label: string;
  labelHy: string;
  labelRu: string;
  href: string;
  icon: string;
  color: string;
}

export const SOCIAL_ITEMS: SocialItem[] = [
  {
    key: "instagram",
    label: "Instagram",
    labelHy: "Ինստագրամ",
    labelRu: "Инстаграм",
    href: SOCIAL_LINKS.instagram,
    icon: "📸",
    color: "#E4405F",
  },
  {
    key: "facebook",
    label: "Facebook",
    labelHy: "Ֆեյսբուք",
    labelRu: "Фейсбук",
    href: SOCIAL_LINKS.facebook,
    icon: "📘",
    color: "#1877F2",
  },
  {
    key: "youtube",
    label: "YouTube",
    labelHy: "ՅուԹյուբ",
    labelRu: "Ютуб",
    href: SOCIAL_LINKS.youtube,
    icon: "▶️",
    color: "#FF0000",
  },
  {
    key: "tiktok",
    label: "TikTok",
    labelHy: "ՏիկՏոկ",
    labelRu: "ТикТок",
    href: SOCIAL_LINKS.tiktok,
    icon: "🎵",
    color: "#000000",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    labelHy: "Թվիթթեր",
    labelRu: "Твиттер",
    href: SOCIAL_LINKS.twitter,
    icon: "🐦",
    color: "#1DA1F2",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    labelHy: "ԼինքեդԻն",
    labelRu: "Линкедин",
    href: SOCIAL_LINKS.linkedin,
    icon: "💼",
    color: "#0A66C2",
  },
  {
    key: "telegram",
    label: "Telegram",
    labelHy: "Տելեգրամ",
    labelRu: "Телеграм",
    href: SOCIAL_LINKS.telegram,
    icon: "✈️",
    color: "#26A5E4",
  },
  {
    key: "spotify",
    label: "Spotify",
    labelHy: "Սփոթիֆայ",
    labelRu: "Спотифай",
    href: SOCIAL_LINKS.spotify,
    icon: "🎧",
    color: "#1DB954",
  },
  {
    key: "discord",
    label: "Discord",
    labelHy: "Դիսքորդ",
    labelRu: "Дискорд",
    href: SOCIAL_LINKS.discord,
    icon: "💬",
    color: "#5865F2",
  },
  {
    key: "github",
    label: "GitHub",
    labelHy: "ԳիթՀաբ",
    labelRu: "Гитхаб",
    href: SOCIAL_LINKS.github,
    icon: "🐙",
    color: "#181717",
  },
  {
    key: "email",
    label: "Email",
    labelHy: "Էլ. փոստ",
    labelRu: "Почта",
    href: `mailto:${SOCIAL_LINKS.email}`,
    icon: "📧",
    color: "#EA4335",
  },
  {
    key: "website",
    label: "Website",
    labelHy: "Կայք",
    labelRu: "Сайт",
    href: SOCIAL_LINKS.website,
    icon: "🌐",
    color: "#4285F4",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────

/**
 * Get social items with localized labels
 */
export function getLocalizedSocialItems(lang: "en" | "hy" | "ru" = "en"): SocialItem[] {
  return SOCIAL_ITEMS.map(item => ({
    ...item,
    label: lang === "hy" ? item.labelHy : lang === "ru" ? item.labelRu : item.label,
  }));
}

/**
 * Get social item by key
 */
export function getSocialItem(key: SocialKey): SocialItem | undefined {
  return SOCIAL_ITEMS.find(item => item.key === key);
}

/**
 * Get social link by key
 */
export function getSocialLink(key: SocialKey): string | undefined {
  const item = getSocialItem(key);
  return item?.href;
}

/**
 * Get social items by category (for displaying in groups)
 */
export function getSocialItemsByCategory(): {
  social: SocialItem[];
  professional: SocialItem[];
  other: SocialItem[];
} {
  const socialKeys: SocialKey[] = ["instagram", "facebook", "youtube", "tiktok", "twitter", "telegram"];
  const professionalKeys: SocialKey[] = ["linkedin", "github", "spotify"];
  const otherKeys: SocialKey[] = ["email", "website", "discord"];

  return {
    social: SOCIAL_ITEMS.filter(item => socialKeys.includes(item.key)),
    professional: SOCIAL_ITEMS.filter(item => professionalKeys.includes(item.key)),
    other: SOCIAL_ITEMS.filter(item => otherKeys.includes(item.key)),
  };
}

// ─── SOCIAL SHARE ────────────────────────────────────────────────────

interface ShareOptions {
  url?: string;
  title?: string;
  text?: string;
}

export function getShareLinks(options: ShareOptions = {}) {
  const { url = SOCIAL_LINKS.website, title = "NUR Lingo - Learn Armenian", text = "" } = options;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText || encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText || encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText || encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}

// ─── SOCIAL MEDIA CARD ──────────────────────────────────────────────

export const SOCIAL_CARD = {
  title: "NUR Lingo",
  titleHy: "ՆՈՒՐ Լինգո",
  titleRu: "НУР Линго",
  description: "Learn Armenian with Nuri, your friendly pomegranate mascot!",
  descriptionHy: "Սովորիր հայերեն Նուրի՝ քո ընկերական նռան կերպարի հետ։",
  descriptionRu: "Учи армянский с Нури, твоим дружелюбным талисманом гранатом!",
  image: "/images/pomegranate-bg.jpg",
  siteName: "NUR Lingo",
  siteNameHy: "ՆՈՒՐ Լինգո",
  siteNameRu: "НУР Линго",
  twitterHandle: "@nurlingo",
} as const;