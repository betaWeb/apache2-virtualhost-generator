<template>
    <div v-if="this.message" class="flash" :class="flashClass" @click.prevent="close" @mouseover.prevent="stop" @mouseout.prevent="play">
        <Icon v-if="type === 'success'" id="icon__check"></Icon>
        <Icon v-if="type === 'error'" id="icon__cross"></Icon>
        <p class="flash__message">{{ this.message }}</p>
    </div>
</template>

<script>
import Icon from '../Icon.vue'

export default {
  
    name: 'FlashMessage',

    components: { Icon },

    props: {
        id: {
            type: Number,
            default: 0
        },
        message: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: 'error'
        },
        timeout: {
            type: Number,
            default: 20 * 1000
        },
        onClose: {
            type: Function
        }
    },

    data () {
        return {
            time: null
        }
    },

    methods: {
        play () {
            this.time = window.setTimeout(() => this.close(), this.timeout)
        },
        stop () {
            window.clearTimeout(this.time)
            this.time = null
        },
        close () {
            this.$root.$emit('flash.close', { id: this.id })
        }
    },

    computed: {
        flashClass () {
            return `flash__${this.type}`
        }
    },

    mounted () {
        this.play()
    }

}
</script>
