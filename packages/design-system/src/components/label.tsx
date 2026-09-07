import { cn } from "../lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-extrabold tracking-wider uppercase text-[var(--gray)] select-none", className)}
      {...props}
    />
  );
}

export { Label };
