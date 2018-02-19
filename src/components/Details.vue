<template>
<div class="vh__details" :data-deep="deep" :style="style">
    <code class="list__wrapper">
        <ul v-for="(item, index) in list" :key="index" class="list">
            <li class="list__item">
                <span v-if="hasChildren(item)">
                   <strong>&lt;</strong><span class="item__key">{{ item.key }}</span>&nbsp;<span class="item__value">{{ item.value }}</span><strong>&gt;</strong>
                </span>
                <span v-else class="item__key">{{ item.key }}</span>
                <Details v-if="hasChildren(item)" :list="item._children" :deep="deeper" />
                <span v-else class="item__value">{{ item.value | join("&nbsp;&nbsp;") }}</span>
                <span v-if="hasChildren(item)" class="item__key">&lt;&sol;{{ item.key }}&gt;</span>
            </li>
        </ul>
    </code>
</div>
</template>

<script>
import Details from './Details.vue'

export default {

    name: 'Details',

    components: { Details },

    props: {
        'content': {
            type: String,
            default: null
        },
        'list': {
            type: Array,
            default: {}
        },
        'deep': {
            type: Number,
            default: 1
        }
    },

    data () {
        return {
            index: this.deep
        }
    },

    methods: {
        hasChildren (item) {
            return item._children && item._children.length
        },
        joinValue (value) {
            return Array.isArray(value)
                ? value.join(', ')
                : value
        }
    },

    computed: {
        deeper () {
            return this.index += 1
        },
        style () {
            return this.deep !== 1
                ? {'marginLeft': (12 * this.deeper) + 'px'}
                : {}
        }
    }
}
</script>

<style lang="scss">
    @import '../../static/scss/_variables.scss';

    .vh__details {
        background-color: $dark-color;

        &[data-deep="1"] {
            margin-bottom: 2em;
            padding: .5em .5em .5em 1em;

            .list__wrapper .list {
                margin: 0;
                line-height: 24px;

                & > li:nth-child(1) {
                    padding: 0;
                }
            }
        }
    
        .list__wrapper {
            margin: 1em 0;
            padding: 0;

            .list {
                list-style-type: none;
                margin-left: 0;
                padding-left: 0;

                .list__item {
                    padding: 4px 30px;
                    font-size: .95em;
                    color: rgba($white-color, .9);

                    .item__key {
                        font-weight: bold;
                    }
                    .item__value {
                        color: rgba($white-color, .7)
                    }
                }
            }
        }
    }
</style>

