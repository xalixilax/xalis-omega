import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardFooter, CardHeader, CardMedia, CardTitle, CardType } from "./card";
import { Button } from "./button";
import { Switch } from "./switch";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Legacy update card from the home page (archive/css/index.css) */
export const UpdateCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardMedia>
        <CardType>December 1st</CardType>
        <div className="pixelated mx-auto grid size-[200px] place-items-center bg-[repeating-conic-gradient(#3a3e46_0%_25%,#2a2d33_0%_50%)] bg-[length:32px_32px]">
          <span className="font-black">EB</span>
        </div>
      </CardMedia>
      <CardHeader>
        <CardTitle>xali's Enchanted books v0.8</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm tracking-[0.03em]">
          <li>Added Alex's Mobs — Straddle Jump</li>
          <li>Added Alex's Mobs — Lavawaxed</li>
          <li>Added Alex's Mobs — Serpent Charmer</li>
        </ul>
      </CardContent>
    </Card>
  ),
};

/* Legacy resource-pack card (archive/css/resourcepack.css) */
export const PackCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardMedia>
        <CardType>Enhancement</CardType>
        <div className="pixelated mx-auto grid size-[200px] place-items-center bg-[repeating-conic-gradient(#3a3e46_0%_25%,#2a2d33_0%_50%)] bg-[length:32px_32px]">
          <span className="font-black">EV</span>
        </div>
      </CardMedia>
      <CardHeader>
        <CardTitle>Enhanced Vanilla</CardTitle>
        <p className="text-sm tracking-[0.03em]">
          My biggest pack that aims to enhance the look of vanilla by adding overlays to blocks and fixing some
          textures.
        </p>
      </CardHeader>
      <CardFooter className="justify-between">
        <Button size="sm">Download</Button>
        <Switch aria-label="Compact texture toggle" />
      </CardFooter>
    </Card>
  ),
};
