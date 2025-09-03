<script lang="ts">
    import { playResponse, balance, gamestate } from "./Store2";
    import { onMount } from "svelte";
    let bet = 0;
    let loading = false;
    let error = "";

    async function handlePlay() {
        loading = true;
        error = "";
        try {
            // Call play API and store response
            const resp = await fetchPlay(bet);
            playResponse.set(resp);
            gamestate.set("playing");
        } catch (e) {
            error = "Failed to play.";
        }
        loading = false;
    }

    function handleCupClick(cupIndex: number) {
        // Use playResponse to determine win/loss
        // If win, call end-round and update balance
        // If loss, reset to rest
    }

    // Dummy API function, replace with import from API module
    async function fetchPlay(bet: number) {
        // ...API logic...
        return { result: "win", cup: 1, balance: 100 };
    }
</script>

<div class="game-container">
    <input type="number" bind:value={bet} min="1" placeholder="Enter bet" />
    <button on:click={handlePlay} disabled={loading} class="play-btn"
        >Play</button
    >
    {#if error}
        <div class="error">{error}</div>
    {/if}
    {#if $gamestate === "playing"}
        <div class="cups">
            {#each [0, 1, 2] as cup}
                <div class="cup" on:click={() => handleCupClick(cup)}>
                    Cup {cup + 1}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .game-container {
        max-width: 400px;
        margin: auto;
    }
    .play-btn {
        background: #007bff;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
    }
    .cups {
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
    }
    .cup {
        width: 60px;
        height: 80px;
        background: #eee;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
    }
    .cup:hover {
        background: #ddd;
    }
    .error {
        color: red;
        margin-top: 10px;
    }
</style>
