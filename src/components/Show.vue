<template>
  <div>
      <loader v-show="loader"></loader>
      <div v-show="!loader && item">
        <div class="toolbar">
            <router-link class="toolbar__link back__link" :to="{ name: 'vh.index'}">Retour</router-link>
            <router-link class="toolbar__link" :to="{ name: 'vh.edit', params: {id: item.id}}" title="Editer la configuration">
                <Icon id="icon__edit" />
            </router-link>
            <router-link v-if="item.enabled" class="toolbar__link" :to="{ name: 'vh.edit', params: {id: item.id}}" title="Désactiver le site">
                <Icon id="icon__stop" />
            </router-link>
            <router-link v-else class="toolbar__link" :to="{ name: 'vh.edit', params: {id: item.id}}" title="Activer le site">
                <Icon id="icon__play" />
            </router-link>
            <router-link class="toolbar__link" :to="{ name: 'vh.edit', params: {id: item.id}}" title="Télécharger le fichier">
                <Icon id="icon__download" />
            </router-link>
        </div>
        <div class="info">
            <p><strong>Nom du fichier</strong>&nbsp;:&nbsp;&nbsp;<span>{{ item.filename }}</span></p>
            <p><strong>Chemin complet</strong>&nbsp;:&nbsp;&nbsp;<span>{{ item.path }}</span></p>
            <p v-if="item.enabled"><strong>Activé</strong>&nbsp;:&nbsp;&nbsp;<span>Oui <small>(<em>{{ item.enabled }}</em>)</small></span></p>
            <p><strong>Détails&nbsp;:</strong></p>
            <List :list="item.parsed" />
        </div>
      </div>
  </div>
</template>

<script lang="babel">
import Loader from './Loader.vue'
import List from './List.vue'
import Icon from './Icon.vue'
import VHMaganer from '../app/VHMaganer'
export default {
    components: { Loader, List, Icon },

    data () {
        return {
            loader: true,
            item: {
                id: null,
                filename: null,
                content: null,
                parsed: null,
                enabled: false
            }
        }
    },

    methods: {
        fetchItem: async function () {
            this.item = await VHMaganer.find(this.$route.params.id)
            this.loader = false
        }
    },

    async mounted () {
        await this.fetchItem()
    }
}
</script>

<style lang="scss">
    @import '../../static/scss/_variables.scss';

    .info {
        padding: 0 2em;
    }

    .toolbar .action__icon {
        width: 28px;
        height: 28px;
        margin: 0 2px;
        transition: stroke .4s;

        &:hover {
            stroke: $main-color;
        }
    }
</style>
