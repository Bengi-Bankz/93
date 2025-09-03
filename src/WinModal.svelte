<script lang="ts">
    export let amountWon: number;
    export let payoutMultiplier: number;
    export let betAmount: number;
    export let show: boolean;
</script>

{#if show}
    <div class="win-modal-backdrop"></div>
    <div class="win-modal">
        <h2>Congratulations!</h2>
        <div class="win-info">
            <div><strong>Amount Won:</strong> ${amountWon.toFixed(2)}</div>
            <div>
                <strong>Payout Multiplier:</strong> x{payoutMultiplier.toFixed(
                    2,
                )}
            </div>
            <div><strong>Bet Amount:</strong> ${betAmount.toFixed(2)}</div>
        </div>
        <slot></slot>
    </div>
{/if}

<style>
    .win-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        z-index: 300;
    }
    .win-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border-radius: 1em;
        box-shadow: 0 0.5em 2em rgba(0, 0, 0, 0.18);
        padding: 2em 3em;
        z-index: 301;
        min-width: 20em;
        max-width: 90vw;
        text-align: center;
    }
    .win-modal h2 {
        color: #0072ff;
        margin-bottom: 1em;
        font-size: 2em;
    }
    .win-info {
        font-size: 1.2em;
        margin-bottom: 1.5em;
    }
    .win-info div {
        margin: 0.5em 0;
    }
</style>
