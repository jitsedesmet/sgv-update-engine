<script lang="ts">
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
      const route = `?source=${encodeURIComponent(href)}`;
      return {str: part, href, route };
    });
  })
</script>

<div class="breadcrumbs">
    <span>
      Browse Location:
    </span>
    <span>
        {#each crumbs as crumb}
            /<a href={crumb.route}>{crumb.str}</a>
        {/each}
    </span>
    <span>
        Open Location:
    </span>
    <span>
        {#each crumbs as crumb}
            /<a href={crumb.href}>{crumb.str}</a>
        {/each}
    </span>
</div>

<style>
    .breadcrumbs {
        padding: 0 0 10px 0;
        display: grid;
        grid-template-columns: fit-content(200px) auto;
        column-gap: 5px;
    }
</style>