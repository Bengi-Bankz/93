import Overlay from './Overlay.svelte';
import { mount } from 'svelte';

const overlayTarget = document.createElement('div');
overlayTarget.id = 'svelte-overlay';
document.body.appendChild(overlayTarget);

mount(Overlay, { target: overlayTarget });
