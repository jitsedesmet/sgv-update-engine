<script lang="ts">
  // https://docs.triply.cc/yasgui-api/#yasgui-api-reference
  // https://www.youtube.com/watch?v=Y5IiSdcqdeQ&themeRefresh=1
  import Yasqe from "@triply/yasqe";
  import {QueryEngine} from "@comunica/query-sparql-file";
  import {SgvEngine} from "$lib";
  import type {ActionReturn} from "svelte/action";

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
      console.log(query);
      await (await sgvEngine).performOperation(query).catch(err => error = err);
    });
    return {
      update({ query: newQuery }) {
        if (newQuery !== undefined) yasqe.setValue(newQuery);
        query = undefined;
      },
      destroy() {
        yasqe.destroy();
      }
    };
  }

  interface Props {
    query: string | undefined;
    pod: string;
  }
  let { query, pod }: Props = $props();
  let error = $state<string | undefined>(undefined);
  const engine = new QueryEngine();
  let sgvEngine = $derived(SgvEngine.init(engine, pod));
</script>


<div class="myError">
    {error}
</div>
<div use:yasge={{ query }} class="yasge"></div>

<style>
    :global {
        @import "@triply/yasqe/build/yasqe.min.css";
    }
    .myError {
        color: red;
    }
</style>