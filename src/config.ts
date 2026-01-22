export const PLANS = {
	FREE: {
		name: "FREE",
		price: "€0",
		events: 3,
		categories: 3,
		triggers: 10,
	},
	PRO: {
		name: "PRO",
		price: "€80",
		events: 100,
		categories: 10,
		triggers: 100,
	},
} as const;

export const MAX_API_KEYS_PER_USER = 10 as const;
