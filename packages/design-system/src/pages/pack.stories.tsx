import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Search } from "lucide-react";
import { Button } from "../components/button";
import { Card, CardContent, CardFooter, CardMedia, CardTitle, CardType } from "../components/card";
import { PageTitle } from "../components/kicker";
import { Input } from "../components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select";

const meta = {
  title: "Pages/Resourcepack",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const packs = [
  {
    type: "Enhancement",
    title: "Enhanced Vanilla",
    copy: "My biggest pack that aims to enhance the look of vanilla by adding overlays to blocks and fixing some textures.",
    deps: ["vanilla", "optifine"],
  },
  {
    type: "Enhancement",
    title: "Enhanced Biomes: River & Pond",
    copy: "Gives rivers, ponds and their shores a fresh coat of paint with connected textures.",
    deps: ["vanilla", "optifine"],
  },
  {
    type: "Retexture",
    title: "xali's Enchanted Books",
    copy: "Every vanilla enchantment gets its own unique, colorful book. 500+ textures.",
    deps: ["vanilla"],
  },
  {
    type: "Retexture",
    title: "xali's Potion",
    copy: "Unique potion colors per effect, so you always know what you are drinking.",
    deps: ["vanilla"],
  },
];

const versions = [
  { label: "1.20.x", value: "1.20" },
  { label: "1.19.x", value: "1.19" },
  { label: "1.18.x", value: "1.18" },
];

function PlaceholderMedia({ label }: { label: string }) {
  return (
    <div className="pixelated mx-auto grid size-[200px] place-items-center bg-[repeating-conic-gradient(#3a3e46_0%_25%,#2a2d33_0%_50%)] bg-[length:32px_32px]">
      <span className="text-2xl font-black tracking-widest text-white/80">{label}</span>
    </div>
  );
}

function PackPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--light-gray)]">
      <nav className="sticky top-0 z-40 bg-[var(--light-gray)] shadow-md">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-8">
          <a href="#" className="text-sm font-extrabold tracking-wider text-[var(--gray)] uppercase">
            Home
          </a>
          <Button size="sm">About</Button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1440px] px-8 py-12">
        <PageTitle className="mb-10">Texture Packs</PageTitle>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex w-full max-w-xl items-center gap-2">
            <Search className="size-5 text-[var(--gray)]" />
            <Input placeholder="Search packs…" aria-label="Search packs" />
          </div>
          <div className="flex items-center gap-2">
            <Select items={versions} defaultValue="1.20">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {versions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm">Filter</Button>
          </div>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack) => (
            <li key={pack.title}>
              <Card>
                <CardMedia>
                  <CardType>{pack.type}</CardType>
                  <PlaceholderMedia label={pack.deps[0].slice(0, 2).toUpperCase()} />
                </CardMedia>
                <CardContent>
                  <CardTitle>{pack.title}</CardTitle>
                  <p className="text-sm tracking-[0.03em]">{pack.copy}</p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button size="sm">
                    <Download /> Download
                  </Button>
                  <span className="text-[9px] font-bold tracking-wider text-[var(--type-label)] uppercase">
                    {pack.deps.join(" · ")}
                  </span>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      </main>

      <footer className="mt-auto">
        <div className="h-8 bg-[var(--yellow-dark)]" />
      </footer>
    </div>
  );
}

export const Default: Story = {
  render: () => <PackPage />,
};
