<script lang="ts">
  import {dereferenceTriples} from "$lib/ui/rdfFetch";

  interface Props {
    source: string;
  }

  let { source }: Props = $props();
  let content = $derived.by(() => dereferenceTriples(source));
</script>

<div class="browser">
    {#await content}
        <p>Loading...</p>
    {:then content}
        <div class="grid">
            {#each content as line}
                {#each line as item}
                    {#if 'href' in item}
                        <a href={item.href}>{item.str}</a>
                    {:else}
                        <div>{item.str}</div>
                    {/if}
                {/each}
            {/each}
        </div>

    {/await}
</div>

<style>
    .browser {
        height: 500px;
        width: 1500px;
        border: black 2px solid;
        padding: 10px;
        margin: 10px;
        overflow: scroll;
    }

    .grid {
        display: grid;
        grid-template-columns: auto auto auto;
        gap: 10px;
    }
</style>