import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "../lib/utils";

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props} />;
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("inline-flex w-fit items-center gap-1 rounded-none bg-[var(--light-gray)] p-1", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-none border-b-4 border-transparent px-4 text-sm font-bold tracking-wider uppercase text-[var(--gray)] transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-active:border-[var(--yellow-dark)] data-active:bg-yellow data-active:text-white [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn("text-sm outline-none", className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
