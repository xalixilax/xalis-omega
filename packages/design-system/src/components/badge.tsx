import { cn } from "../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-none px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-muted text-[var(--type-label)]",
        yellow: "bg-yellow text-white",
        red: "bg-destructive text-white",
        discord: "bg-discord text-white",
        teal: "bg-teal text-white",
        outline: "border border-[var(--gray)] bg-transparent text-[var(--gray)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant = "default", ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
