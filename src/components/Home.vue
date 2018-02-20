<template>
    <div>
        <Loader v-show="loader" />
        <div class="toolbar">
            <router-link class="toolbar__link" :to="{ name: 'vh.add' }">Ajouter un vhost</router-link>
        </div>
        <ul class="table">
            <li class="table__head">
                <div class="items__title">Fichiers ({{ filteredList.length }})</div>
                <div class="enabled__title">Activé</div>
                <div class="actions__title">Actions</div>
            </li>
            <li class="table_search">
                <input type="text" placeholder="Rechercher..." v-model="query" @keyup.prevent="doSearch">
            </li>
            <li class="table_empty" v-if="noSearchResults">Aucun résultat pour &laquo; {{ this.query }} &raquo;</li>
            <li v-for="(item, key) in filteredList" :key="key" class="table__item">
                <router-link class="table__link" :to="{ name: 'vh.show', params: { id: item.id }}">{{ item.filename }}</router-link>
                <div class="table__enabled" :title="item.enabled ? item.enabled : ''">
                    <Icon v-if="item.enabled" id="icon__check" :class="enabledCss(item.enabled)" />
                    <Icon v-else id="icon__cross" :class="enabledCss(item.enabled)" />
                </div>
                <Actions :item="item" class="table__actions" />
            </li>
        </ul>
    </div>
</template>

<script lang="babel">
import VHMaganer from '../app/VHMaganer'
import Icon from './Icon.vue'
import Loader from './Loader.vue'
import Actions from './Actions.vue'
import debounce from 'lodash.debounce'
export default {

    components: { Icon, Loader, Actions },

    data () {
        return {
            loader: true,
            list: [],
            filteredList: [],
            error: null,
            query: ''
        }
    },

    methods: {
        async fetchList () {
            try {
                this.list = await VHMaganer.all()
                this.filteredList = this.list
            } catch (e) {
                // this.$root.$emit('flash', { message: e })
                flash(e)
            }
            this.loader = false
        },

        enabledCss: function (enabled = false) {
            let cls = ['enabled__icon']
            if (enabled) return [cls, ...['is-enabled']]
            return cls
        },

        doSearch: debounce(function (e) {
            if (!this.query.length) {
                this.filteredList !== this.list && (this.filteredList = this.list)
                return
            }
            this.filteredList = this.list.filter(item => item.filename.indexOf(this.query) >= 0)
        }, 300)
    },

    computed: {
        noSearchResults () {
            return this.query.length && !this.filteredList.length
        }
    },

    async mounted () {
        await this.fetchList()
        listen('vh.duplicated', ({ info }) => this.filteredList.push(info))
        listen('vh.destroyed', ({ id }) => this.filteredList = this.filteredList.filter(item => item.id != id))
    }
}
</script>

<style lang="scss">
    @import '../../static/scss/_variables.scss';
    
    .table {
        display: block;
        float: left;
        width: 100%;
        list-style-type: none;
        margin: 0;
        padding: 0;

        .table__head, .table__item, .table_search, .table_empty {
            height: 36px;
            line-height: 36px;
            font-size: .95em;

            .items__title, .enabled__title, .actions__title {
                display: block;
                float: left;
                text-align: center;
                font-weight: bold;
                color: rgba($text-color, .7);
                border-bottom: 2px solid rgba($text-color, .334);
            }

            .items__title {
                width: 50%;
            }

            .enabled__title {
                width: 16.6667%;
            }

            .actions__title {
                width: 33.3334%;
            }
        }

        .table_empty {
            font-style: italic;
            text-align: center;
            color: $text-color;
            border-top: 1px solid rgba($text-color, .334);
            font-size: .85em;
        }

        .table_search {
            input {
                margin: 0;
                border: none;
                background-color: transparent;
                color: rgba($text-color, .8);
                height: inherit;
                line-height: inherit;
            }
        }

        .table__item {
            padding: 0 1em;

            &:nth-child(odd) {
                background-color: rgba($dark-color, .1);
            }

            &:hover {
                background-color: rgba($main-color, .1667);
            }

            .table__link, .table__actions, .table__enabled {
                display: block;
                float: left;
            }

            .table__enabled {
                text-align: center;
                width: 16.667%;

                .icon {
                    width: 22px;
                    height: 22px;

                    &.enabled__icon {
                        stroke: $error-color;

                        &.is-enabled {
                            stroke: $success-color;
                        }
                    }
                }
            }

            .table__link {
                width: 50%;
                font-size: .9em;
                font-style: italic;
                color: rgba($dark-color, .7);
            }
            .table__actions {
                width: 33.3334%;
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }
        }
    }
</style>

