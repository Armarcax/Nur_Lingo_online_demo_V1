"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/80 group-[.toaster]:text-foreground group-[.toaster]:border-white/10 group-[.toaster]:backdrop-blur-xl group-[.toaster]:shadow-2xl rounded-xl",
          description: "group-[.toast]:text-muted-foreground/80",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground rounded-lg",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-muted-foreground rounded-lg",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };


