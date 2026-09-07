import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="download">
      <TabsList>
        <TabsTrigger value="download">
          <Download /> Download
        </TabsTrigger>
        <TabsTrigger value="install">
          <Upload /> Install
        </TabsTrigger>
      </TabsList>
      <TabsContent value="download">Grab the latest zip.</TabsContent>
      <TabsContent value="install">Drop it into resourcepacks.</TabsContent>
    </Tabs>
  ),
};
