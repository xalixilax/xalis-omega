import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <span className="text-sm font-bold text-[var(--gray)]">Enhanced Vanilla</span>
      <Separator />
      <p className="text-sm">Hairline dividers use the light border gray.</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center gap-3">
      <span className="text-sm">Vanilla</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Optifine</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Continuity</span>
    </div>
  ),
};
