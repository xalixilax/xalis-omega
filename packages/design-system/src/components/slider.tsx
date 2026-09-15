import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "../lib/utils";

function Slider({ className, ...props }: SliderPrimitive.Root.Props<number>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "inline-flex w-32 shrink-0 touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-4 w-full items-center rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <SliderPrimitive.Track className="h-1.5 w-full overflow-hidden rounded-none bg-[var(--border)]">
          <SliderPrimitive.Indicator className="h-full bg-yellow" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="size-4 rounded-[2px] border border-b-2 border-[var(--gray)] border-b-[var(--yellow-dark)] bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
