// src/components/Footer.tsx
"use client";

import { SOCIAL_ITEMS, SOCIAL_LINKS } from "@/config/social";
import { NewsletterForm } from "@/components/Newsletter/NewsletterForm";
import { useI18n } from "@/hooks/useI18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {t("Footer_nur_lingo")}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Footer_description")}
          </p>
          <a
            href={SOCIAL_LINKS.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            nurlingo.com
          </a>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("Footer_follow_us")}
          </h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SOCIAL_ITEMS.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target={s.key === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent"
                >
                  {t(s.label)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("Footer_stay_updated")}
          </h4>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("Footer_stay_updated_description")}
          </p>
          <div className="mt-3">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {t("Footer_copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}

export default Footer;