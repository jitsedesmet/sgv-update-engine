<script lang="ts">
  // https://docs.triply.cc/yasgui-api/#yasgui-api-reference
  // https://www.youtube.com/watch?v=Y5IiSdcqdeQ&themeRefresh=1
  import Yasqe from "@triply/yasqe";
  import {QueryEngine} from "@comunica/query-sparql-file";
  import {SgvEngine} from "$lib";
  import type {ActionReturn} from "svelte/action";
  import {goto} from "$app/navigation";
  import {alterQuery} from "$lib/ui/helpers.svelte";

  interface YasgeContext {
    query: string | undefined;
  }
  function yasge(element: HTMLElement, { query: startQuery }: YasgeContext): ActionReturn<YasgeContext> {
    const yasqe = new Yasqe(element, {
      editorHeight: '300px',
      requestConfig: {
        method: "GET",
        endpoint: 'http://localhost:3000/pods/'
      }
    });
    if (startQuery !== undefined) yasqe.setValue(startQuery);
    yasqe.on('query', async () => {
      const query = yasqe.getValue();
      error = undefined;
      const sgvEngine = await SgvEngine.init(engine, pod)
      try {
        if (autoFocus) {
          const [willChange] = await sgvEngine.performOperation(query, true);
            if (willChange) {
                await goto(alterQuery('source', willChange));
            }
        }
        await sgvEngine.performOperation(query, false);
      } catch (err: unknown) {
        error = (err as Error).message;
      }
      toggle();
    });
    return {
      update({ query: newQuery }) {
        if (newQuery !== undefined) {
          error = undefined;
          yasqe.setValue(newQuery);
        }
        query = undefined;
      },
      destroy() {
        yasqe.destroy();
      }
    };
  }

  function toggle() {
    recompute = !recompute;
  }

  interface Props {
    query: string | undefined;
    pod: string;
    recompute: boolean;
    autoFocus: boolean;
  }
  let {
    query,
    pod,
    recompute = $bindable(),
    autoFocus,
  }: Props = $props();
  let error = $state<string | undefined>(undefined);
  const engine = new QueryEngine();
</script>


{#if error}
    <div class="myError">
        <span>
            {error}
        </span>
        <button aria-label="close error" onclick={() => error = undefined}>
            <svg viewBox="0 0 10 10" height="0.75em">
                <path stroke-linecap="round" stroke-linejoin="round" d="M 0 0 L 10 10 M 0 10 L 10 0" />
            </svg>
        </button>
    </div>
{/if}
<div use:yasge={{ query }} class="yasge"></div>

<style>
    :global {
        @import "@triply/yasqe/build/yasqe.min.css";
    }
    .myError {
        display: flex;
        padding: 0.25em;
        background: rgba(255, 65, 54, 0.66);
        border-radius: 0.25em 0.25em 0 0;
        color: black;
    }
    .myError span {
        flex: 1;
        padding: 0 0 0 10px;
        align-self: center;
    }
    .myError button {
        padding: 0 10px;
        background: none;
        border: none;
        box-shadow: none;
    }
    svg {
    /*    thickness*/
        stroke-width: 1;
        color: black;
        stroke: black;
    }

</style>