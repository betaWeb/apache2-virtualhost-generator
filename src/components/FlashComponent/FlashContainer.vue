<template>
  <div v-show="hasMessages" class="flash__container">
      <FlashMessage v-for="(item, key) in list" :key="key" :id="item.id" :message="item.message" :type="item.type" :timeout="item.timeout" />
  </div>
</template>

<script>
import FlashMessage from './FlashMessage.vue'
import uniqueId from 'lodash.uniqueid'

export default {

    name: 'FlashContainer',
  
    components: { FlashMessage },

    data () {
        return {
            list: []
        }
    },

    methods: {
        addItem ({ message, type, timeout }) {
            if (this.list.length >= 6) this.removeItem(this.list[0].id)
            const id = parseInt(uniqueId(), 10)
            this.list.push({ id, message, type, timeout })
        },
        removeItem (id) {
            this.list = this.list.filter(item => item.id !== id)
        }
    },

    computed: {
        hasMessages () {
            return this.list.length
        }
    },

    mounted () {
        this.$root.$on('flash', this.addItem.bind(this))
        this.$root.$on('flash.close', ({ id }) => this.removeItem(id))
    }
}
</script>

<style lang="scss">
    @import '../../../static/scss/_variables.scss';

    .flash__container {
        position: fixed;
        top: 10px;
        right: 10px;
        width: auto;
        max-width: 400px;

        .flash {
            position: relative;
            display: block;
            width: 100%;
            margin: .25em 0;
            padding: .5em 1em;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 0 8px -2px rgba($black-color, .2);

            .flash__message {
                display: inline-block;
                vertical-align: middle;
                margin: 0;
                color: $white-color;
                font-size: .85em;
                font-weight: 300;
                padding-left: calc(1em + 22px);
            }

            &.flash__success {
                background-color: $success-color;
            }

            &.flash__error {
                background-color: $error-color;
            }

            .icon {
                position: absolute;
                top: .5em;
                left: 1em;
                stroke: $white-color;
                width: 22px;
                height: 22px;
            }
        }
    }
</style>