<script lang="ts">
  interface Props {
    source: string;
  }

  let {source}: Props = $props();

  let crumbs = $derived.by(() => {
    const url = new URL(source);
    const paths = url.pathname.split('/').filter(Boolean);
    const base = url.origin;

    return paths.map((path, index) => {
      const href = [base, ...paths.slice(0, index + 1), ''].join('/');
      return {str: path, href};
    });
  })
</script>

<div class="breadcrumbs">
    <span>
      Browse Location:
    </span>
    <span>
        {#each crumbs as crumb}
            /<a href={crumb.href}>{crumb.str}</a>
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