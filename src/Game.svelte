<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import WinModal from "./WinModal.svelte";
    import MenuModal from "./MenuModal.svelte";

    const API_MULTIPLIER = 1000000;
    const gamestate = writable("rest");
    const response = writable<any>(null);
    const endRoundResponse = writable<any>(null);
    const balance = writable(1000);
    const lastWin = writable(0);

    // Win modal state
    const showWinModal = writable(false);
    const winAmount = writable(0);
    const winMultiplier = writable(0);

    // Menu modal state
    const showMenuModal = writable(false);

    const getParam = (key: string) =>
        new URLSearchParams(window.location.search).get(key);
    async function getRGSResponse(endpoint: string, body: any): Promise<any> {
        const res = await fetch(`https://${getParam("rgs_url")}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return res.json();
    }

    onMount(async () => {
        const res = await getRGSResponse("/wallet/authenticate", {
            sessionID: getParam("sessionID"),
            language: getParam("language") || "en",
        });
        balance.set(res.balance.amount / API_MULTIPLIER);
        console.log("loaded..");
    });

    const endRound = async () => {
        const confirmation = await getRGSResponse("/wallet/end-round", {
            sessionID: getParam("sessionID"),
        });
        balance.set(confirmation.balance.amount / API_MULTIPLIER);
        endRoundResponse.set(confirmation);
        if (confirmation?.balance.amount != null) {
            gamestate.set("rest");
        }
    };

    // --- BET BAR STATE ---
    const betAmount = writable(1);
    const showModal = writable(false);

    // Logical step function for bet increments
    function step(val: number) {
        if (val < 1) return 0.1;
        if (val < 10) return 0.2;
        if (val < 100) return 1;
        if (val < 500) return 5;
        return 10;
    }

    // Generate bet options
    const betOptions = [
        ...Array.from({ length: 10 }, (_, i) => +(0.1 * (i + 1)).toFixed(2)), // 0.10 to 1.00
        ...Array.from({ length: 10 }, (_, i) => +(1 + 0.2 * i).toFixed(2)), // 1.00 to 2.80
        ...Array.from({ length: 8 }, (_, i) => +(3 + i).toFixed(2)), // 3 to 10
        12,
        15,
        20,
        25,
        50,
        100,
        200,
        500,
        1000,
    ];

    async function getBookResponse() {
        let gs;
        gamestate.subscribe((value) => (gs = value))();
        if (gs == "rest") {
            balance.update((b) => b - $betAmount);
        }
        const resp = await getRGSResponse("/wallet/play", {
            mode: getParam("mode") ?? "BASE",
            currency: getParam("currency"),
            sessionID: getParam("sessionID"),
            amount: $betAmount * API_MULTIPLIER,
        });
        endRoundResponse.set(null);
        response.set(resp);
        gamestate.set("playing");
        if (resp != null) {
            lastWin.set(resp.round.payoutMultiplier);
            // Show win modal if payoutMultiplier > 0
            if (
                resp.round.payoutMultiplier &&
                resp.round.payoutMultiplier > 0
            ) {
                winMultiplier.set(resp.round.payoutMultiplier);
                winAmount.set($betAmount * resp.round.payoutMultiplier);
                showWinModal.set(true);
            }
        }
        let lw;
        lastWin.subscribe((value) => (lw = value))();
        if (lw == undefined) {
            gamestate.set("rest");
            lastWin.set(0);
        }
        console.log(lw);
        console.log(resp.round.state);
    }
</script>

<div class="game-wrapper">
    <button
        class="menu-btn"
        type="button"
        aria-label="Menu"
        on:click={() => showMenuModal.set(!$showMenuModal)}
    >
        {#if $showMenuModal}
            ×
        {:else}
            &#9776;
        {/if}
    </button>
    <div class="game-content">
        <h2>Balance: {Number($balance).toFixed(2)}</h2>
        <h2>Round Win: {$lastWin}</h2>
    </div>

    <div class="bet-bar-fixed">
        <div class="bet-bar-controls">
            <button class="action-btn" on:click={getBookResponse}
                >Place Bet</button
            >
            <button class="action-btn" on:click={endRound}>End Round</button>
        </div>
        <div class="bet-bar">
            <button
                class="bet-btn"
                on:click={() =>
                    betAmount.update((b) =>
                        Math.max(0.1, +(b - step(b)).toFixed(2)),
                    )}>-</button
            >
            <button
                class="bet-amount"
                type="button"
                aria-label="Select bet amount"
                on:click={() => showModal.set(true)}
                >{$betAmount.toFixed(2)}</button
            >
            <button
                class="bet-btn"
                on:click={() =>
                    betAmount.update((b) =>
                        Math.min(1000, +(b + step(b)).toFixed(2)),
                    )}>+</button
            >
        </div>
    </div>

    {#if $showModal}
        <button
            class="modal-backdrop"
            type="button"
            aria-label="Close bet modal"
            on:click={() => showModal.set(false)}
        ></button>
        <div class="bet-modal">
            <h3>Select Bet Amount</h3>
            <div class="bet-options">
                {#each betOptions as option}
                    <button
                        class="bet-option-btn"
                        on:click={() => {
                            betAmount.set(+option);
                            showModal.set(false);
                        }}>{(+option).toFixed(2)}</button
                    >
                {/each}
            </div>
        </div>
    {/if}

    <WinModal
        amountWon={$winAmount}
        payoutMultiplier={$winMultiplier}
        betAmount={$betAmount}
        show={$showWinModal}
    >
        <button
            class="action-btn"
            style="margin-top:1em;"
            on:click={() => showWinModal.set(false)}>Close</button
        >
    </WinModal>

    <MenuModal show={$showMenuModal} onClose={() => showMenuModal.set(false)}>
        <!-- Add menu content here -->
        <div style="margin-bottom:1em;">Menu content goes here.</div>
    </MenuModal>

    <div class="json-stack">
        <h3>play/ response</h3>
        <div class="bet-display">
            <pre>{JSON.stringify($response, null, 2)}</pre>
        </div>

        <h3>end-round/ response</h3>
        <div class="end-display">
            <pre>{JSON.stringify($endRoundResponse, null, 2)}</pre>
        </div>
    </div>
</div>

<style>
    .action-btn {
        background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0.75em 2em;
        margin: 0.5em;
        font-size: 1.1em;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
    }
    .action-btn:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
    }

    .bet-bar-fixed {
        position: fixed;
        left: 50%;
        bottom: 0.5em;
        transform: translateX(-50%);
        z-index: 200;
        width: max-content;
        max-width: 60em;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: auto;
    }
    .bet-bar-controls {
        display: flex;
        justify-content: center;
        gap: 1em;
        margin-bottom: 0.5em;
    }
    .bet-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 1em;
        box-shadow: 0 0.125em 1em rgba(0, 0, 0, 0.12);
        padding: 0.5em 1em;
    }
    .bet-btn {
        background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 1.5em;
        height: 1.5em;
        font-size: 1.5em;
        font-weight: bold;
        margin: 0 0.5em;
        box-shadow: 0 0.125em 0.5em rgba(0, 0, 0, 0.12);
        cursor: pointer;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .bet-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
    }
    .bet-amount {
        background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
        color: #fff;
        border-radius: 8px;
        padding: 0.5em 1.5em;
        font-size: 1.2em;
        font-weight: 700;
        margin: 0 0.5em;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        border: 2px solid #fff2;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
    }
    .bet-amount:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    }
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: 100;
    }
    .bet-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: hsl(0, 0%, 50%);
        border-radius: 1em;
        box-shadow: 0 0.5em 2em rgba(0, 0, 0, 0.18);
        padding: 2em;
        z-index: 101;
        min-width: 20em;
        max-width: 60em;
    }
    .bet-modal h3 {
        margin-top: 0;
        margin-bottom: 1em;
        color: #000000;
        font-size: 1.2em;
        font-weight: 700;
        text-align: center;
    }
    .bet-options {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5em;
        justify-content: center;
        max-height: 300px;
        overflow-y: auto;
    }
    .bet-option-btn {
        background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0.5em 1em;
        font-size: 1em;
        font-weight: 600;
        margin: 0.2em;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
    }
    .bet-option-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
    }
    .menu-btn {
        position: fixed;
        top: 1em;
        right: 1em;
        z-index: 500;
        background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
        color: #fff;
        border: none;
        border-radius: 16%;
        width: 2em;
        height: 2em;
        font-size: 2em;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
    }
    .menu-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
        background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
    }
</style>
