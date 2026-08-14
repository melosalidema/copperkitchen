import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from 'react';

/** Shared, intentionally-simple admin UI primitives. */

export function AdminPanel({
  title,
  subtitle,
  children,
  action
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-semibold text-brand-text_primary">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-brand-text_secondary">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function LoadingNote({ label = 'Loading…' }: { label?: string }) {
  return (
    <p className="py-6 text-center text-sm text-brand-text_secondary">{label}</p>
  );
}

export function ErrorNote({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-brand-error/30 bg-brand-error/10 p-4 text-sm text-brand-error"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-semibold underline"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function SuccessNote({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-brand-success/30 bg-brand-success/10 p-3 text-sm font-medium text-brand-success"
    >
      {message}
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export function AdminButton({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-brand-primary text-white hover:bg-brand-accent',
    secondary:
      'border border-brand-border bg-brand-background text-brand-text_primary hover:border-brand-primary hover:text-brand-primary',
    danger:
      'border border-brand-error/40 bg-brand-error/10 text-brand-error hover:bg-brand-error/20'
  };
  return (
    <button
      type="button"
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

const inputClasses =
  'h-10 w-full rounded-lg border border-brand-border bg-brand-background px-3 text-sm text-brand-text_primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30';

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClasses} ${props.className ?? ''}`} />;
}

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClasses} ${props.className ?? ''}`} />
  );
}

export function AdminTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-brand-border bg-brand-background px-3 py-2 text-sm text-brand-text_primary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${props.className ?? ''}`}
    />
  );
}

export function Field({
  label,
  htmlFor,
  children
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-text_secondary"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function AdminCheckbox({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 items-center gap-2 text-sm text-brand-text_primary">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-brand-primary"
      />
      {label}
    </label>
  );
}
