import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const versions = [
  { label: "1.20.x", value: "1.20" },
  { label: "1.19.x", value: "1.19" },
  { label: "1.18.x", value: "1.18" },
];

export const Default: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <Label>Game version</Label>
      <Select items={versions} defaultValue="1.20">
        <SelectTrigger>
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
    </div>
  ),
};
