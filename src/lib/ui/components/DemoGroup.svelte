<script lang="ts">
    import {demoQueries} from "$lib/ui/pods";

    interface Props {
      query: string | undefined;
      pod: string;
    }
    let { query = $bindable(), pod }: Props = $props();
</script>

<div class="demo-group">
    {#each demoQueries as element}
        <button onclick={() => query = element.query(pod)}>{element.name}</button>
    {/each}
</div>

<style>
    .demo-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    button {
        flex: 1 1 0;
    }
</style>
