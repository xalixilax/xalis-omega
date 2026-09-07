import { cn } from "../lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("card-shadow flex h-full flex-col border-0 bg-card text-card-foreground", className)}
      {...props}
    />
  );
}

/* Legacy card: first child is the dark media block (#1a1d21) with a floating type label */
function CardMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-media"
      className={cn("relative rounded-t-[5px] bg-card-dark text-center text-white", className)}
      {...props}
    />
  );
}

function CardType({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="card-type"
      className={cn("absolute top-2.5 left-3 text-[9px] font-bold tracking-wider text-[var(--type-label)] uppercase", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return <h5 data-slot="card-title" className={cn("text-lg font-extrabold text-[var(--gray)]", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-sm tracking-[0.03em] text-foreground/80", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("flex flex-1 flex-col gap-3 p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center gap-2 p-6 pt-0", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle, CardType };
