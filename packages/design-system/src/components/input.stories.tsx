import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="search">Search packs</Label>
      <Input id="search" placeholder="Search…" />
    </div>
  ),
};

export const TextareaStory: Story = {
  name: "Textarea",
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="notes">Changelog</Label>
      <Textarea id="notes" placeholder="Added…" />
    </div>
  ),
};
