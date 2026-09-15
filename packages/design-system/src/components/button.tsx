import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-none border-b-[6px] font-bold tracking-wider uppercase transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:tracking-[2px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "border-b-[var(--yellow-dark)] bg-yellow text-white hover:border-b-[var(--yellow-darker)] hover:bg-[var(--yellow-dark)]",
        destructive: "border-b-[var(--red-dark)] bg-destructive text-white hover:border-b-[var(--red-darker)] hover:bg-[var(--red-dark)]",
        discord: "border-b-[var(--discord-dark)] bg-discord text-white hover:border-b-[var(--discord-darker)] hover:bg-[var(--discord-dark)]",
        neutral: "border-b-[var(--gray-dark)] bg-gray text-white hover:border-b-[var(--gray-darker)] hover:bg-[var(--gray-dark)]",
        outline: "border-b-[var(--gray-dark)] bg-transparent text-[var(--gray-dark)] hover:bg-white",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-muted",
      },
      size: {
        sm: "h-[38px] border-b-4 px-6 text-base",
        default: "h-[60px] px-12 text-lg",
        icon: "size-10 border-b-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
