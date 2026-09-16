import { NEWSLETTER_CONFIG } from "@/config/newsletter";

export function NewsletterSuccess({ email }: { email: string }) {
  return (
    <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
      {NEWSLETTER_CONFIG.successMessage} <span className="font-medium">{email}</span>
    </div>
  );
}


export default NewsletterSuccess;



