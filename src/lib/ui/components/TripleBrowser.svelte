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
  let changeCount = $derived.by(async () => (await content).filter(([, , , changed]) => changed).length);
</script>

{#snippet uriThingy(item: UiTriple[0], markChanged: boolean)}
    {#if 'href' in item && item.href !== undefined}
        <a class:markChanged={markChanged} href={alterQuery('source', item.href)}>{item.str}</a>
    {:else}
        <div class:markChanged={markChanged}>{item.str}</div>
    {/if}
{/snippet}

<div class="header">
    <Breadcrumbs source={source} />

    {#await Promise.all([content, changeCount])}
        ?
    {:then [content, changeCount]}
        {#if changeCount === 0}
                <span style="font-weight: bold">
                    Showing {content.length} triples
                </span>
        {:else}
                <span style="color: rgba(119, 238, 119, 1); font-weight: bold">
                    Changed {changeCount} triples, Showing {content.length} triples
                </span>
        {/if}
    {/await}
</div>

<div class="browser">

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
    .header {
        display: flex;
        justify-content: space-between;
        position: sticky;
        top: -2px;
        padding: 10px 10px 0 10px;
        background: white;
        margin: 0 10px;
        border: black solid;
        border-width: 2px 2px 0 2px;
    }
    .browser {
        height: 100%;
        width: calc(100% - 44px);
        border: black solid;
        border-width: 0 2px 2px 2px;
        padding: 0 10px 10px 10px;
        margin: 0 10px;
        overflow: scroll;
    }

    .grid {
        display: grid;
        grid-template-columns: auto auto auto;
    }

    @keyframes back {
      0% {
          background: rgba(119, 238, 119, 0.5);
          animation-timing-function: ease-out;
      }
      10% {
          background: rgba(119, 238, 119, 1);
          animation-timing-function: ease-in;
      }
      20% {
          background: rgba(119, 238, 119, 0.5);
      }
      100% {
          background: rgba(119, 238, 119, 0.5);
      }
    }
    .markChanged {
        animation: back 10s forwards ease;
    }
</style>