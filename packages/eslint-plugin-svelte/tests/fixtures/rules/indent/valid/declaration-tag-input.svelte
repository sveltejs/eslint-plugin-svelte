{#each boxes as box}
  {const area = box.width * box.height}
  {let label = `${area} square pixels`}
  {var doubled = area * 2}
  {function format(value) {
    return `${value} square pixels`;
  }}

  <p>{format(doubled)} ({label})</p>
{/each}
