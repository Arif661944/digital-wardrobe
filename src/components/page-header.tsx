import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="font-heading text-2xl text-muted-foreground">Opening the closet…</p>
    </div>
  );
}
