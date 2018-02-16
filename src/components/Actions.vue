<template>
    <div>
        <router-link :to="{ name: 'vh.edit', params: {id: item.id} }" class="btn" title="Editer la configuration">
            <Icon id="icon__edit" />
        </router-link>
        <button v-if="item.enabled" class="btn" title="Désactiver le site" @click.prevent="disable">
            <Icon id="icon__stop" />
        </button>
        <button v-if="!item.enabled" class="btn" title="Activer le site" @click.prevent="enable">
            <Icon id="icon__play" />
        </button>
        <button class="btn" title="Télécharger le fichier" @click.prevent="download">
            <Icon id="icon__download" />
        </button>
    </div>
</template>

<script>
import Icon from './Icon.vue'
import VHMaganer from '../app/VHMaganer'

export default {

    components: { Icon },
  
    props: {
        item: {
            type: Object,
            default: {}
        }
    },

    methods: {
        download () {
            VHMaganer.download(this.item.id)
        },

        async enable () {
            const id = this.item.id
            const result = await VHMaganer.enableConfig(id)
            this.$root.$emit('vh.enabled', { id })
        },

        async disable () {
            const id = this.item.id
            const result = await VHMaganer.disableConfig(id)
            this.$root.$emit('vh.disabled', { id })
        }
    }

}
</script>

