<template>
    <svg xmlns="http://www.w3.org/2000/svg" :viewBox="viewbox" class="icon action__icon">
        <use :xlink:href="iconId"></use>
    </svg>
</template>

<script>
export default {
  name: 'Icon',

  props: {
      id: {
          type: String
      },
      viewbox: {
          type: String,
          default: '0 0 24 24'
      }
  },

  computed: {
      iconId () {
          return `#${this.id}`
      }
  }
}
</script>
