<script lang="ts">
    export let show: boolean;
    export let onClose: () => void;
</script>

{#if show}
    <button
        class="menu-modal-backdrop"
        type="button"
        aria-label="Close menu modal"
        on:click={onClose}
    ></button>
    <div class="menu-modal">
        <h2>Menu</h2>
        <div class="menu-modal-content">
            <slot></slot>
        </div>
    </div>
{/if}

<style>
    .menu-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.2);
        z-index: 400;
    }
    .menu-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        border-radius: 1em;
        box-shadow: 0 0.5em 2em rgba(0, 0, 0, 0.18);
        padding: 2em 1.5em;
        z-index: 401;
        width: 80vw;
        height: 80vh;
        min-width: 10em;
        min-height: 10em;
        max-width: 100vw;
        max-height: 100vh;
        text-align: left;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .menu-modal h2 {
        color: #0072ff;
        margin-bottom: 1em;
        font-size: 1.5em;
    }
    .menu-modal-content {
        flex: 1 1 auto;
        width: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        word-break: break-word;
        display: flex;
        flex-direction: column;
        gap: 1em;
    }
    @media (max-width: 600px) {
        .menu-modal {
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            transform: none;
            width: 100vw;
            height: 100vh;
            min-width: 0;
            min-height: 0;
            max-width: 100vw;
            max-height: 100vh;
            padding: 1em 0.5em;
            border-radius: 0.5em;
        }
    }
</style>
