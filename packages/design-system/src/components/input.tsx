import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "../lib/utils";

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "h-[50px] w-full min-w-0 rounded-[3px] border border-[var(--input)] bg-white px-4 text-sm text-[var(--gray-darker)] transition-colors outline-none placeholder:text-[var(--gray)] focus-visible:border-[var(--yellow-dark)] focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
