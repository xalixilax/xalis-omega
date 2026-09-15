import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kicker, PageTitle, SectionTitle } from "./kicker";

const meta = {
  title: "Components/Headings",
  component: Kicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Kicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <div className="flex w-[36rem] flex-col items-center gap-8">
      <PageTitle>Texture Packs</PageTitle>
      <SectionTitle>Recent Updates</SectionTitle>
      <Kicker>December 1st · enhancement</Kicker>
    </div>
  ),
};
