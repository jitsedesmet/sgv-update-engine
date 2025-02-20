<script lang="ts">
  import Yasge from "$lib/ui/components/Yasge.svelte";
  import {page} from "$app/state";
  import {POD} from "$lib/ui/pods";
  import TripleBrowser from "$lib/ui/components/TripleBrowser.svelte";
  import PodSelector from "$lib/ui/components/PodSelector.svelte";
  import DemoGroup from "$lib/ui/components/DemoGroup.svelte";

  let query = $state<string | undefined>(undefined);
  let pod = $derived<string>(page.url.searchParams.get('pod') ?? POD.BY_CREATION);
  let source = $derived<string>(page.url.searchParams.get('source') ?? POD.BY_CREATION);
  let recompute = $state<boolean>(false);

</script>

<h1>Storage Guidance Vocab. Engine</h1>

<DemoGroup bind:query={query} />

<PodSelector pod={pod} />

<Yasge bind:recompute={recompute} pod={pod} query={query} />

<TripleBrowser recompute={recompute} source={source} />

<style>
    @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Funnel+Display:wght@300..800&display=swap');
    h1 {
        text-align: center;
        font-family: "Audiowide", serif;
        font-style: normal;
        font-size: 3em;
        font-weight: 400;
        margin: 0 0 0.25em 0;
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
    }
</style>