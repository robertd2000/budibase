<script lang="ts">
  import "@spectrum-css/typography/dist/index-vars.css"

  // Sizes
  export let size = "M"
  export let textAlign = undefined
  export let noPadding = false
  export let weight = "default" // light, heavy, default
</script>

<h1
  data-testid="typography-heading"
  style={textAlign ? `text-align:${textAlign}` : ``}
  class:noPadding
  class="spectrum-Heading spectrum-Heading--size{size} spectrum-Heading--{weight}"
>
  <slot />
</h1>

<style>
  h1 {
    font-family: var(--font-accent);
  }

  h1 {
    text-wrap: balance;
  }
</style>
