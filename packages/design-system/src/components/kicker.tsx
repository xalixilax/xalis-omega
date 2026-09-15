import { cn } from "../lib/utils";

/* Legacy `.type` label — tiny uppercase tag, also used as the h1 side-lines heading */
function Kicker({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="kicker"
      className={cn("text-[9px] font-bold tracking-wider text-[var(--type-label)] uppercase", className)}
      {...props}
    />
  );
}

/* Legacy h2 — uppercase, yellow, with the minecraft multi-layer shadow */
function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="section-title"
      className={cn(
        "text-shadow-mc [--tw-shadow-color:var(--yellow-dark)] text-4xl leading-none font-extrabold text-[var(--yellow)] uppercase",
        className,
      )}
      {...props}
    />
  );
}

/* Legacy h1 — uppercase black 900 with horizontal rules on both sides */
function PageTitle({ className, children, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="page-title"
      className={cn("relative z-0 text-center text-5xl leading-none font-black text-[var(--gray-dark)] uppercase", className)}
      {...props}
    >
      <span className="relative z-[-1] inline-block h-0.5 w-full bg-[#333] align-middle" />
      <span className="relative inline-block bg-[var(--light-gray)] px-6">{children}</span>
      <span className="relative z-[-1] inline-block h-0.5 w-full bg-[#333] align-middle" />
    </h1>
  );
}

export { Kicker, PageTitle, SectionTitle };
