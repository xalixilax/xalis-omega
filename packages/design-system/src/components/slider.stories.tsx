import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Slider } from "./slider";

const meta = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex w-64 items-center gap-3">
      <Label htmlFor="brush">Brush</Label>
      <Slider id="brush" defaultValue={16} min={1} max={64} className="w-full" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <Slider defaultValue={40} min={0} max={100} disabled />,
};
