<template>
  <div>
      <Loader v-show="loader" />
      <div v-show="!loader && item">
        <div class="toolbar toolbar__show">
            <router-link class="toolbar__link back__link" :to="{ name: 'vh.index'}">Retour</router-link>
            <Actions :item="item" class="toolbar__actions" />
        </div>
        <div class="info">
            <p><strong>Nom du fichier</strong>&nbsp;:&nbsp;&nbsp;<span>{{ item.filename }}</span></p>
            <p><strong>Chemin complet</strong>&nbsp;:&nbsp;&nbsp;<span>{{ item.filePath }}</span></p>
            <p v-if="item.enabled"><strong>Activé</strong>&nbsp;:&nbsp;&nbsp;Oui</p>
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
import Actions from './Actions.vue'
import VHMaganer from '../app/VHMaganer'
export default {
    components: { Loader, List, Icon, Actions },

    data () {
        return {
            loader: true,
            item: {
                id: null,
                filename: null,
                filePath: null,
                content: null,
                parsed: null,
                enabled: false
            }
        }
    },

    methods: {
        fetchItem: async function () {
            try {
                this.item = await VHMaganer.find(this.$route.params.id)
            } catch (e) {
                this.$root.$emit('flash', { message: e })
            }
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

    .toolbar__show {
        .toolbar__actions {
            float: right;

            .action__icon {
                width: 28px;
                height: 28px;
                margin: 0 2px;
                transition: stroke .4s;

                &:hover {
                    stroke: $main-color;
                }
            }
        }
    }
</style>
