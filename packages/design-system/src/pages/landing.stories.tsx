import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader, CardMedia, CardTitle, CardType } from "../components/card";
import { Kicker, SectionTitle } from "../components/kicker";

const meta = {
  title: "Pages/Home",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = ["Resourcepack", "Datapack", "Tutorial", "FAQ"];

const slides = [
  { title: "ENHANCED VANILLA", caption: "Minecraft 2.0, here I come!", a: "#2f4f3f", b: "#1f2228" },
  { title: "XALI'S AMETHYST", caption: "Shiny!", a: "#3d3559", b: "#1f2228" },
  { title: "XALI'S ROPE", caption: "I wonder if I can reach the top?", a: "#4f4230", b: "#1f2228" },
];

const updates = [
  {
    date: "December 1st",
    title: "xali's Enchanted books v0.8",
    items: ["Added Alex's Mobs — Straddle Jump", "Added Alex's Mobs — Lavawaxed", "Added Alex's Mobs — Serpent Charmer", "Added Alex's Mobs — Returning board"],
  },
  {
    date: "November 12th",
    title: "Enhanced Vanilla v1.4",
    items: ["Overhauled glazed terracotta", "Fixed lily pad overlay seams", "Added bushy leaves for tall grass"],
  },
];

const socials = ["curseforge", "discord", "optifine", "patreon", "pmc", "vanilla"];

function PlaceholderMedia({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`pixelated grid place-items-center bg-[repeating-conic-gradient(#3a3e46_0%_25%,#2a2d33_0%_50%)] bg-[length:32px_32px] ${className}`}
    >
      <span className="text-2xl font-black tracking-widest text-white/80">{label}</span>
    </div>
  );
}

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--dark-bg)] text-[var(--light-gray)]">
      {/* Hero header — legacy header.png fading into the dark body */}
      <header className="relative flex h-[420px] flex-col justify-end">
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,var(--gray-darker),var(--card-dark))]"
          aria-hidden
        >
          <PlaceholderMedia label="xali" className="mx-auto mt-20 size-40 rounded-lg opacity-90" />
        </div>
        <div className="relative mx-auto w-full max-w-[1440px] px-8 pb-10">
          <div className="slope-so flex flex-col items-start gap-3 bg-[var(--dark-bg)] px-8 pt-8">
            <h1 className="text-shadow-mc text-6xl font-black tracking-tight text-white uppercase [--tw-shadow-color:#000]">
              xali's packs
            </h1>
            <p className="text-sm tracking-[0.03em] text-[var(--light-gray)]/70">
              Vanilla tweaks and enhancement resource packs for Optifine &amp; Continuity.
            </p>
          </div>
        </div>
      </header>

      {/* Sticky light navbar — legacy bootstrap navbar */}
      <nav className="sticky top-0 z-40 bg-[var(--light-gray)] shadow-md">
        <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-8">
          <a href="#" className="text-sm font-extrabold tracking-wider text-[var(--gray)] uppercase">
            Home
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a key={item} href="#" className="text-sm font-semibold text-[var(--gray-dark)] hover:text-[var(--yellow-dark)]">
                {item}
              </a>
            ))}
          </div>
          <Button size="sm">About</Button>
        </div>
      </nav>

      <main>
        {/* Carousel hero — slope cut into the light section below */}
        <section className="slope-sb -mb-[4vw] relative z-10 bg-[var(--card-dark)]">
          <div className="relative mx-auto max-w-[1440px]">
            <PlaceholderMedia label="enhanced vanilla" className="h-[26rem] w-full opacity-60" />
            <div className="absolute right-10 bottom-[calc(1.25rem+2vw)] text-right">
              <h5 className="text-shadow-mc text-6xl leading-none font-extrabold text-[var(--yellow)] uppercase [--tw-shadow-color:var(--yellow-dark)]">
                {slides[0].title}
              </h5>
              <p className="mt-2 text-base tracking-[0.03em] text-white/90">{slides[0].caption}</p>
            </div>
            <button aria-label="Previous slide" className="absolute top-1/2 left-4 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition-transform hover:scale-110">
              <ChevronUp className="size-5 -rotate-90" />
            </button>
            <button aria-label="Next slide" className="absolute top-1/2 right-4 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition-transform hover:scale-110">
              <ChevronDown className="size-5 rotate-90" />
            </button>
          </div>
        </section>

        {/* Recent updates — sloped light section */}
        <section className="slope-sb bg-[var(--light-gray)] px-8 pt-[calc(4vw+3rem)] pb-24 text-[var(--gray-darker)]">
          <div className="mx-auto max-w-[1440px]">
            <SectionTitle className="mb-8">Recent Updates</SectionTitle>
            <div className="grid gap-6 lg:grid-cols-3">
              {updates.map((update) => (
                <Card key={update.title}>
                  <CardMedia>
                    <CardType>{update.date}</CardType>
                    <PlaceholderMedia label="eb" className="mx-auto size-[200px]" />
                  </CardMedia>
                  <CardHeader>
                    <CardTitle>{update.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 text-sm tracking-[0.03em]">
                      {update.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
              <div className="flex flex-col gap-3">
                <Kicker>Supported platforms</Kicker>
                <div className="flex flex-wrap gap-2">
                  {socials.map((social) => (
                    <Badge key={social} variant="outline">
                      {social}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Legacy yellow footer with the darker strip */}
      <footer>
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-8 py-6 text-sm font-bold tracking-[10px] text-[var(--yellow-darker)] uppercase">
          <span>xali</span>
          <div className="flex gap-3">
            {socials.slice(0, 4).map((social) => (
              <span key={social} className="text-xs tracking-normal normal-case underline-offset-2 hover:underline">
                {social}
              </span>
            ))}
          </div>
        </div>
        <div className="h-8 bg-[var(--yellow-dark)]" />
      </footer>
    </div>
  );
}

export const Default: Story = {
  render: () => <HomePage />,
};
