<script lang="ts">
  import {dereferenceTriples, type UiTriple} from "$lib/ui/rdfFetch";
  import Breadcrumbs from "$lib/ui/components/Breadcrumbs.svelte";
  import {alterQuery} from "$lib/ui/helpers.svelte";

  interface Props {
    source: string;
    recompute: boolean;
  }

  let { source, recompute }: Props = $props();
  let contentSource = $state('');
  let recompState = $state(recompute);
  let content = $state<Promise<UiTriple[]>>(Promise.resolve([]))
  $effect(() => {
    const dummy = recompute;
    if (contentSource === source) {
      if (recompute !== recompState) {
        console.log('reusing content');
        recompState = recompute;
        content = dereferenceTriples(source, content);

      }
    } else {
      contentSource = source;
      content = dereferenceTriples(source);
    }
  });
</script>

{#snippet uriThingy(item: UiTriple[0], markChanged: boolean)}
    {#if 'href' in item && item.href !== undefined}
        <a class:markChanged={markChanged} href={alterQuery('source', item.href)}>{item.str}</a>
    {:else}
        <div class:markChanged={markChanged}>{item.str}</div>
    {/if}
{/snippet}

<div class="browser">
    <Breadcrumbs source={source} />

    {#await content}
        <p>Loading...</p>
    {:then content}
        <div class="grid">
            {#each content as [subj, pred, obj, changed]}
                {@render uriThingy(subj, changed)}
                {@render uriThingy(pred, changed)}
                {@render uriThingy(obj, changed)}
            {/each}
        </div>
    {/await}
</div>

<style>
    .browser {
        height: 100%;
        width: calc(100% - 44px);
        border: black 2px solid;
        padding: 10px;
        margin: 10px;
        overflow: scroll;
    }

    .grid {
        display: grid;
        grid-template-columns: auto auto auto;
    }

    @keyframes back {
      0% { background: rgba(119, 238, 119, 1); }
      50% { background: rgba(119, 238, 119, 1); }
      100% { background: rgba(255, 255, 0, 0); }
    }
    .markChanged {
        animation: back 5s forwards ease;
    }
</style>