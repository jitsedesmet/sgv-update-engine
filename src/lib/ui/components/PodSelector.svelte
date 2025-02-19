<script lang="ts">
  import {goto} from "$app/navigation";
  import {POD} from "$lib/ui/pods";

  interface Props {
    pod: string;
  }

  let {pod}: Props = $props();
</script>


<div class="pod-selector">
    <select bind:value={pod} onchange={() => {console.log('routes'); goto(`?source=${pod}&pod=${pod}`)}}>
        <option value={POD.BY_CREATION}>By Creation Date</option>
        <option value={POD.BY_LOCATION}>By location</option>
        <option value={POD.SEPARATE}>Separately</option>
        <option value={POD.TOGETHER}>Together</option>
    </select>

    Corresponds to pod: <a href={pod}>{pod}</a>
</div>

<style>
    .pod-selector {
        padding: 10px 0;
    }
</style>