import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kicker, PageTitle, SectionTitle } from "../components/kicker";

const meta = {
  title: "Tokens/Typography",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-5 p-8">
      <Kicker>Typography — Montserrat everywhere</Kicker>
      <PageTitle>Texture packs</PageTitle>
      <SectionTitle>Recent updates</SectionTitle>
      <div className="text-lg font-extrabold text-[var(--gray)]">Card title — 18pt extrabold gray</div>
      <div className="text-sm text-[var(--gray-darker)]">Body — Montserrat regular, letter-spacing 0.01em.</div>
      <div className="text-sm tracking-[0.03em] text-foreground/70">Light copy — .f-light tracking 0.03em.</div>
      <div className="text-[9px] font-bold tracking-wider text-[var(--type-label)] uppercase">Type label — 9px 700 uppercase.</div>
    </div>
  ),
};
