import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "../lib/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch inline-flex shrink-0 items-center rounded-[3px] border-b-4 border-[var(--gray)] bg-[var(--light-gray)] px-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-checked:border-[var(--yellow-dark)] data-checked:bg-yellow disabled:cursor-not-allowed disabled:opacity-50 h-[22px] w-[38px]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-3.5 rounded-[2px] bg-white shadow-sm transition-transform group-data-checked:translate-x-4"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
