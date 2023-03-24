<div>
  <!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
  {#await Promise.resolve(42)}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {/await}
</div>
<div>
  <!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
  {#await Promise.resolve(42)}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {:then name}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {:catch name}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {/await}
</div>
<div>
  <!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
  {#await Promise.resolve(42)}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {:then name}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {/await}
</div>
<div>
  <!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
  {#await Promise.resolve(42) then n}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {/await}
</div>
<div>
  <!-- svelte-ignore a11y-label-has-associated-control a11y-no-noninteractive-tabindex -->
  {#await Promise.resolve(42) catch n}
    <label tabindex="0">Click</label>
    <ul tabindex="0" />
  {/await}
</div>
