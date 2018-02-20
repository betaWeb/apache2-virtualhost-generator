<template>
    <div class="vh__actions">
        <router-link :to="{ name: 'vh.edit', params: {id: item.id} }" class="btn" title="Editer la configuration">
            <Icon id="icon__edit" />
        </router-link>
        <button class="btn" title="Dupliquer la configuration" @click.prevent="duplicate">
            <Icon id="icon__copy" />
        </button>
        <button v-if="item.enabled" class="btn" title="Désactiver le site" @click.prevent="disable">
            <Icon id="icon__stop" />
        </button>
        <button v-if="!item.enabled" class="btn" title="Activer le site" @click.prevent="enable">
            <Icon id="icon__play" />
        </button>
        <button class="btn" title="Télécharger le fichier" @click.prevent="download">
            <Icon id="icon__download" />
        </button>
        <button class="btn" @click.prevent="destroy" :disabled="item.enabled" :title="destroyTitle">
            <Icon id="icon__trash" />
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
            await this._toggleConfig(true, 'Vhost activé avec succès')
        },

        async disable () {
            await this._toggleConfig(false, 'Vhost désactivé avec succès')
        },

        async duplicate () {
            try {
                const id = this.item.id
                const info = await VHMaganer.duplicate(id)
                dispatch('vh.duplicated', { id, info })
                flash("VHost dupliqué avec succès", "success")
            } catch (e) {
                flash(e)
            }
        },

        async destroy () {
            if (!window.confirm("Cette action est irréversible. Etes-vous sûr de vouloir l'effectuer ?")) return
            try {
                const id = this.item.id
                await VHMaganer.destroy(id)
                dispatch('vh.destroyed', { id })
                flash("VHost supprimé avec succès", "success")
            } catch (e) {
                flash(e)
            }
        },

        async _toggleConfig (state, message) {
            let type = undefined
            try {
                const methodName = `${state ? 'enable' : 'disable'}Config`
                await VHMaganer[methodName].call(null, this.item.id)
                this.item.enabled = state
                type = 'success'
            } catch (e) {
                message = e
            }
            flash(message, type)
        }
    },

    computed: {
        destroyTitle () {
            return this.item.enabled 
                ? "Vous ne pouvez pas supprimer un VHost activé" 
                : "Supprimer la configuration"
        }
    }

}
</script>

<style lang="scss">
    @import '../../static/scss/_variables.scss';

    .vh__actions .btn[disabled] {
        cursor: not-allowed;

        .action__icon {
            stroke: rgba($text-color, .4);
        }
    }
</style>

