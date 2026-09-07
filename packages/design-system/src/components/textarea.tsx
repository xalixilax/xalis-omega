import { cn } from "../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-[3px] border border-[var(--input)] bg-white px-4 py-3 text-sm text-[var(--gray-darker)] transition-colors outline-none placeholder:text-[var(--gray)] focus-visible:border-[var(--yellow-dark)] focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
