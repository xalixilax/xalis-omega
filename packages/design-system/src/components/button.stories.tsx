import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: { children: "Download" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} />
      <Button {...args} variant="destructive" />
      <Button {...args} variant="discord" />
      <Button {...args} variant="neutral" />
      <Button {...args} variant="outline" />
      <Button {...args} variant="ghost" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} size="sm" />
      <Button {...args} />
      <Button {...args} size="icon" variant="outline">
        <Download />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: { children: "Download pack", size: "sm" },
  render: (args) => (
    <Button {...args}>
      <Download /> {args.children}
    </Button>
  ),
};

export const Disabled: Story = {
  args: { children: "Download", disabled: true },
};
