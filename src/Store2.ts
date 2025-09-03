import { writable } from "svelte/store";
import type { PlayResponse } from "./api";

export const playResponse = writable<PlayResponse | null>(null);
export const balance = writable<number>(100); // Start with some balance
export const gamestate = writable<string>("rest");
export const betAmountStore = writable<number>(1);
export const gamePhase = writable<
  "idle" | "playing" | "animating" | "selecting" | "resolving"
>("idle");
export const cupsClickable = writable<boolean>(false);
