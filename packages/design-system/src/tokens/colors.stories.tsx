import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kicker } from "../components/kicker";

const meta = {
  title: "Tokens/Colors",
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const swatches: Array<{ name: string; value: string }> = [
  { name: "yellow", value: "var(--yellow)" },
  { name: "yellow-dark", value: "var(--yellow-dark)" },
  { name: "yellow-darker", value: "var(--yellow-darker)" },
  { name: "red", value: "var(--red)" },
  { name: "red-dark", value: "var(--red-dark)" },
  { name: "discord", value: "var(--discord)" },
  { name: "discord-dark", value: "var(--discord-dark)" },
  { name: "discord-darker", value: "var(--discord-darker)" },
  { name: "teal", value: "var(--teal)" },
  { name: "gray", value: "var(--gray)" },
  { name: "gray-dark", value: "var(--gray-dark)" },
  { name: "gray-darker", value: "var(--gray-darker)" },
  { name: "light-gray", value: "var(--light-gray)" },
  { name: "dark-bg", value: "var(--dark-bg)" },
  { name: "card-dark", value: "var(--card-dark)" },
];

export const LegacyPalette: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-8">
      {swatches.map((swatch) => (
        <div key={swatch.name} className="flex w-36 flex-col gap-2">
          <div className="card-shadow h-20" style={{ background: swatch.value }} />
          <div>
            <div className="font-mono text-xs font-bold text-[var(--gray-darker)]">{swatch.name}</div>
            <div className="font-mono text-[0.65rem] text-[var(--gray)]">{swatch.value}</div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Usage: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <Kicker>Roles</Kicker>
      <div className="flex gap-4">
        <div className="flex-1 bg-[var(--dark-bg)] p-4 text-sm text-[var(--light-gray)]">dark-bg — home body</div>
        <div className="flex-1 bg-card-dark p-4 text-sm text-[var(--light-gray)]">card-dark — card media headers</div>
        <div className="flex-1 bg-[var(--light-gray)] p-4 text-sm text-[var(--gray-darker)]">light-gray — subpage body</div>
      </div>
    </div>
  ),
};
