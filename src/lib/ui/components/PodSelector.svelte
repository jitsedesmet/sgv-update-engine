<script lang="ts">
  import {goto} from "$app/navigation";
  import {POD} from "$lib/ui/pods";
  import Switch from "$lib/ui/components/Switch.svelte";

  interface Props {
    pod: string;
    autoFocus: boolean;
  }
  let {
    pod = $bindable(),
    autoFocus = $bindable()
  }: Props = $props();
</script>


<div class="pod-selector">
    <label for="pod">Fragmentation:</label>
    <select bind:value={pod} onchange={() => {console.log('routes'); goto(`?source=${pod}&pod=${pod}`)}}>
        <option value={POD.BY_CREATION}>By Creation Date</option>
        <option value={POD.BY_LOCATION}>By location</option>
        <option value={POD.SEPARATE}>Separately</option>
        <option value={POD.TOGETHER}>Together</option>
    </select>

    <span class="pod-link">
        Corresponds to pod: <a class="breakable" href={pod}>{pod}</a>
    </span>

    <span class="auto-focus">
        <Switch label="Auto Focus" bind:checked={autoFocus} />
    </span>
</div>

<style>
    .pod-selector {
        display: flex;
        flex-wrap: wrap;
        padding: 10px 0;
    }
    label, span {
        margin: auto 5px;
    }
    .pod-link {
        flex-grow: 1;
        max-width: 100%;
    }
</style>