export const potions: Namespace<Potion> = {
	minecraft: [
		{
			potion: "night_vision",
			long: true,
		},
		{
			potion: "invisibility",
			long: true,
		},
		{
			potion: "leaping",
			long: true,
			strong: true,
		},
		{
			potion: "fire_resistance",
			long: true,
		},
		{
			potion: "swiftness",
			long: true,
			strong: true,
		},
		{
			potion: "slowness",
			long: true,
			strong: true,
		},
		{
			potion: "water_breathing",
			long: true,
		},
		{
			potion: "healing",
			strong: true,
		},
		{
			potion: "harming",
			strong: true,
		},
		{
			potion: "poison",
			long: true,
			strong: true,
		},
		{
			potion: "regeneration",
			long: true,
			strong: true,
		},
		{
			potion: "strength",
			long: true,
			strong: true,
		},
		{
			potion: "weakness",
			strong: true, // Input has strong: true, but target JSON has strong_weakness (/pl)
		},
		{
			potion: "luck",
			long: true, // Input has long: true, but target JSON only has base luck (/p)
		},
		{
			potion: "turtle_master",
			long: true,
		},
		{
			potion: "slow_falling",
			long: true,
		},
		{
			potion: "infested",
		},
		{
			potion: "oozing",
		},
		{
			potion: "weaving",
		},
		{
			potion: "wind_charged",
		},
		{
			potion: "awkward",
		},
		{
			potion: "mundane",
		},
		{
			potion: "thick",
		},
		{
			potion: "water",
		}
	],
};

export type Potion = {
	potion: string;
	long?: boolean;
	strong?: boolean;
};

export type Namespace<T> = {
	minecraft: T[];
	[key: string]: T[];
};
