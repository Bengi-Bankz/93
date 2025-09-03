<script lang="ts">
    let betAmount = 1;
    let loading = false;

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

    function handlePlay() {
        loading = true;
        // TODO: Add play logic here
        setTimeout(() => {
            loading = false;
        }, 500); // Simulate loading
    }
</script>

<div class="overlay-ui">
    <div class="bet-bar-row">
        <button
            class="bet-btn"
            on:click={() =>
                (betAmount = Math.max(
                    0.1,
                    +(betAmount - step(betAmount)).toFixed(2),
                ))}>-</button
        >
        <button
            class="bet-amount"
            type="button"
            aria-label="Select bet amount"
            on:click={() => (showModal = true)}>{betAmount.toFixed(2)}</button
        >
        <button
            class="bet-btn"
            on:click={() =>
                (betAmount = Math.min(
                    1000,
                    +(betAmount + step(betAmount)).toFixed(2),
                ))}>+</button
        >
        <button class="play-btn" on:click={handlePlay} disabled={loading}
            >Play</button
        >
    </div>
</div>

<style>
    .overlay-ui {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100vw;
        pointer-events: none;
        z-index: 10;
    }
    .bet-bar-row {
        position: fixed;
        left: 50%;
        bottom: 32px;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95);
        padding: 18px 24px;
        border-radius: 12px;
        pointer-events: auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12);
        z-index: 20;
    }
    .play-btn {
        background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0.75em 2em;
        font-size: 1.1em;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        cursor: pointer;
        transition:
            transform 0.1s,
            box-shadow 0.1s;
    }
    .play-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .bet-btn {
        background: #eee;
        border: none;
        border-radius: 6px;
        padding: 0.5em 1em;
        font-size: 1.2em;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
    }
    .bet-btn:hover {
        background: #ddd;
    }
    .bet-amount {
        background: #fff;
        border: 2px solid #007bff;
        border-radius: 6px;
        padding: 0.5em 1.2em;
        font-size: 1.2em;
        font-weight: bold;
        color: #007bff;
        cursor: pointer;
        transition: border 0.2s;
    }
    .bet-amount:hover {
        border-color: #00c6ff;
    }
</style>
