import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Enhancement</Badge>
      <Badge variant="yellow">v0.8</Badge>
      <Badge variant="red">breaking</Badge>
      <Badge variant="discord">discord</Badge>
      <Badge variant="teal">vanilla</Badge>
      <Badge variant="outline">optifine</Badge>
    </div>
  ),
};
