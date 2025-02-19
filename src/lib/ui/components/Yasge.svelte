<script lang="ts">
  // https://docs.triply.cc/yasgui-api/#yasgui-api-reference
  // https://www.youtube.com/watch?v=Y5IiSdcqdeQ&themeRefresh=1
  import Yasqe from "@triply/yasqe";

  interface YasgeContext {
    query: string | undefined;
  }
  function yasge(element: HTMLElement, { query: startQuery }: YasgeContext) {
    const yasqe = new Yasqe(element, {editorHeight: '300px'});
    if (startQuery !== undefined) yasqe.setValue(startQuery);
    yasqe.on('query', () => console.log(yasqe.getValue()));
    return {
      update({ query: newQuery }: YasgeContext) {
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
  }
  let {
    query,
  }: Props = $props();
</script>

<div use:yasge={{ query }} class="yasge"></div>

<style>
    :global {
        @import "@triply/yasqe/build/yasqe.min.css";
    }
</style>