<script lang="ts">
  import Yasge from "$lib/ui/components/Yasge.svelte";
  import {page} from "$app/state";
  import {POD} from "$lib/ui/pods";
  import TripleBrowser from "$lib/ui/components/TripleBrowser.svelte";
  import PodSelector from "$lib/ui/components/PodSelector.svelte";
  import DemoGroup from "$lib/ui/components/DemoGroup.svelte";
  import Comunica from "$lib/ui/components/SVG/Comunica.svelte";
  import Solid from "$lib/ui/components/SVG/Solid.svelte";
  import { innerWidth } from 'svelte/reactivity/window';

  let query = $state<string | undefined>(undefined);
  let pod = $derived<string>(page.url.searchParams.get('pod') ?? POD.BY_CREATION);
  let source = $derived<string>(page.url.searchParams.get('source') ?? POD.BY_CREATION);
  let recompute = $state<boolean>(false);
  let autoFocus = $state(true);
  let screenWidth = $derived(innerWidth.current ?? 600);
  let smallScreen = $derived<boolean>(screenWidth < 550);

</script>

{#snippet comunicaLogo()}
    <svg viewBox="0 0 250 250" height="5em" style="flex-shrink: 0; align-self: center">
        <Comunica />
    </svg>
{/snippet}

{#snippet solidLogo()}
    <svg viewBox="0 0 350 350" height="80px" style="flex-shrink: 0; align-self: center">
        <Solid />
    </svg>
{/snippet}

<div class="header">
    {#if !smallScreen}
        <a href="https://comunica.dev/">
            {@render comunicaLogo()}
        </a>
    {/if}
    <a href="/" class="no-style"><h1>Storage Guiding Framework</h1></a>
    {#if !smallScreen}
        <a href="https://solidproject.org/">
            {@render solidLogo()}
        </a>
    {/if}
</div>

<DemoGroup bind:query={query} pod={pod} />

<PodSelector bind:autoFocus={autoFocus} pod={pod} />

<Yasge autoFocus={autoFocus} bind:recompute={recompute} pod={pod} query={query} />

<TripleBrowser recompute={recompute} source={source} />

<footer>
    <a href="https://github.com/jitsedesmet/sgv-update-engine/">
        <svg height="2rem" aria-hidden="true" viewBox="0 0 24 24" version="1.1" width="32" data-view-component="true" class="octicon octicon-mark-github v-align-middle">
            <path d="M12 1C5.9225 1 1 5.9225 1 12C1 16.8675 4.14875 20.9787 8.52125 22.4362C9.07125 22.5325 9.2775 22.2025 9.2775 21.9137C9.2775 21.6525 9.26375 20.7862 9.26375 19.865C6.5 20.3737 5.785 19.1912 5.565 18.5725C5.44125 18.2562 4.905 17.28 4.4375 17.0187C4.0525 16.8125 3.5025 16.3037 4.42375 16.29C5.29 16.2762 5.90875 17.0875 6.115 17.4175C7.105 19.0812 8.68625 18.6137 9.31875 18.325C9.415 17.61 9.70375 17.1287 10.02 16.8537C7.5725 16.5787 5.015 15.63 5.015 11.4225C5.015 10.2262 5.44125 9.23625 6.1425 8.46625C6.0325 8.19125 5.6475 7.06375 6.2525 5.55125C6.2525 5.55125 7.17375 5.2625 9.2775 6.67875C10.1575 6.43125 11.0925 6.3075 12.0275 6.3075C12.9625 6.3075 13.8975 6.43125 14.7775 6.67875C16.8813 5.24875 17.8025 5.55125 17.8025 5.55125C18.4075 7.06375 18.0225 8.19125 17.9125 8.46625C18.6138 9.23625 19.04 10.2125 19.04 11.4225C19.04 15.6437 16.4688 16.5787 14.0213 16.8537C14.42 17.1975 14.7638 17.8575 14.7638 18.8887C14.7638 20.36 14.75 21.5425 14.75 21.9137C14.75 22.2025 14.9563 22.5462 15.5063 22.4362C19.8513 20.9787 23 16.8537 23 12C23 5.9225 18.0775 1 12 1Z"></path>
        </svg>
        <span>Source code</span>
    </a>
    <a href="https://sgf-demo-eswc-2025.jitsedesmet.be/">
        <svg height="1.7rem" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="fill: rgb(100,100,100)">
            <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
            <path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"/></svg>
        <span>Paper</span>
    </a>
    <a href="https://youtu.be/4xJFaYyCSIg">
        <svg height="1.5rem" viewBox="0 0 28.57 20" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <g>
                <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
                <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
            </g>
        </svg>
        <span>Demo on video</span>
    </a>
</footer>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Funnel+Display:wght@300..800&display=swap');
    .no-style, .no-style:visited, .no-style:hover, .no-style:active {
        text-decoration: none;
        color: inherit;
    }
    footer {
        display: flex;
        gap: 1rem;
        padding: 3px 10px;
    }
    footer a {
        display: flex;
        align-items: center;
        vertical-align: center;
        gap: 0.2rem;
    }
    h1 {
        text-align: center;
        font-family: "Audiowide", serif;
        font-style: normal;
        font-size: 3em;
        font-weight: 400;
        margin: 0 0 0.25em 0;
    }
    .header {
        display: flex;
        justify-content: space-between;
    }
    :global {
        *:not(.yasge *) {
            font-family: "Funnel Display", serif;
            font-optical-sizing: auto;
            font-weight: 300;
            font-style: normal;
        }
        a, a:visited, a:hover, a:active { color: #0000ee; }
        button, select {
            appearance: none;
            background-color: #fafbfc;
            border: 1px solid rgba(27, 31, 35, 0.15);
            border-radius: 6px;
            box-shadow:
                    rgba(27, 31, 35, 0.04) 0 1px 0,
                    rgba(255, 255, 255, 0.25) 0 1px 0 inset;
            box-sizing: border-box;
            color: #24292e;
            cursor: pointer;
            display: inline-block;
            font-size: 14px;
            font-weight: 500;
            line-height: 20px;
            list-style: none;
            padding: 6px 16px;
            position: relative;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation;
            vertical-align: middle;
            white-space: nowrap;
            word-wrap: break-word;
        }
        .breakable {
            white-space: pre-wrap; /* CSS3 */
            white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
            white-space: -pre-wrap; /* Opera 4-6 */
            white-space: -o-pre-wrap; /* Opera 7 */
            word-wrap: break-word; /* Internet Explorer 5.5+ */
        }
    }
</style>