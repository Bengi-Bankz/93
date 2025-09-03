import { writable } from "svelte/store";

export const playResponse = writable<any>(null);
export const balance = writable<number>(0);
export const gamestate = writable<string>("rest");
export const betAmountStore = writable<number>(1);
