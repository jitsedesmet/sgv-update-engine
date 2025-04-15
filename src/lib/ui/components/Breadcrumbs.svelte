<script lang="ts">
  import {alterQuery} from "$lib/ui/helpers.svelte";

  interface Props {
    source: string;
  }

  let {source}: Props = $props();

  let crumbs = $derived.by(() => {
    const url = new URL(source);
    const paths = url.pathname.split('/').filter(Boolean);
    const hasTrailingSlash = url.pathname.endsWith('/');
    const base = url.origin;

    return paths.map((part, index) => {
      const pathBuilder = [base, ...paths.slice(0, index + 1)];
      if (hasTrailingSlash || index !== paths.length -1) pathBuilder.push('');
      const href = pathBuilder.join('/');
      const route = alterQuery('source', href);
      return {str: part, href, route };
    });
  })
</script>

<div class="breadcrumbs">
    <div>
      Location (local):
    </div>
    <div>
        {#each crumbs as crumb}
            /<a href={crumb.route} class="breakable">{crumb.str}</a>
        {/each}
    </div>
    <div>
        Location (external):
    </div>
    <div>
        {#each crumbs as crumb}
            /<a href={crumb.href} class="breakable">{crumb.str}</a>
        {/each}
    </div>
</div>

<style>
    .breadcrumbs {
        padding: 0 0 10px 0;
        display: grid;
        grid-template-columns: fit-content(200px) 1fr;
        column-gap: 5px;
        max-width: 100%;
    }
    .breadcrumbs div {
        min-width: 0;
    }
</style>