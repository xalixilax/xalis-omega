import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Switch } from "./switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="compact" defaultChecked />
      <Label htmlFor="compact" className="normal-case tracking-normal">
        Compact texture
      </Label>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Switch />
      <Switch defaultChecked />
      <Switch disabled />
      <Switch defaultChecked disabled />
    </div>
  ),
};
