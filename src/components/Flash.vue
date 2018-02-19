<template>
<div>
    <div v-if="this.message" class="flash" :class="flashClass" @click.prevent="close">
        <Icon v-if="type === 'success'" id="icon__check"></Icon>
        <Icon v-if="type === 'error'" id="icon__cross"></Icon>
        <p class="flash__message">{{ this.message }}</p>
    </div>
</div>
</template>

<script>
import Icon from './Icon.vue'

export default {
  
    name: 'Flash',

    components: { Icon },

    data () {
        return {
            message: null,
            type: 'error',
            timeout: 20 * 1000
        }
    },

    methods: {
        close () {
            this.message = null
            this.type = 'error'
            this.$forceUpdate()
        }
    },

    computed: {
        flashClass () {
            return `flash__${this.type}`
        }
    },

    mounted () {
        this.$root.$on('flash', ({ message, type, timeout }) => {
            this.close()
            this.message = message
            if (type) this.type = type
            if (timeout) this.timeout = timeout
            window.setTimeout(() => this.close(), this.timeout)
        })
    }

}
</script>

<style lang="scss">
    @import '../../static/scss/_variables.scss';

    .flash {
        position: fixed;
        top: 10px;
        right: 10px;
        width: auto;
        max-width: 400px;
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
</style>
