import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

type ContactLinkProps = {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Renders a table-cell contact value (email/phone/telegram) as a link, without triggering the row's onClick navigation. */
export function ContactLink({
  href,
  icon,
  children,
  className,
}: ContactLinkProps) {
  return (
    <a
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'text-fg hover:text-primary group/link inline-flex min-w-0 items-center gap-1.5 transition-colors',
        className,
      )}
    >
      <span className="text-fg-muted group-hover/link:text-primary shrink-0 transition-colors">
        {icon}
      </span>
      <span className="truncate group-hover/link:underline">{children}</span>
    </a>
  );
}
