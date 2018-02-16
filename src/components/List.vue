<template>
<div class="list__wrapper" :style="style">
    <ul v-for="(item, index) in list" :key="index" class="list" :data-deep="deep">
        <li class="list__item">
            <span v-if="hasChildren(item)">
                <span class="item__key">&lt;{{ item.key }}</span>&nbsp;<span class="item__value">{{ item.value }}</span>&gt;
            </span>
            <span v-else class="item__key">{{ item.key }}&nbsp;</span>
            <List v-if="hasChildren(item)" :list="item._children" :deep="deeper" />
            <span v-else class="item__value">&nbsp;{{ item.value | join("&nbsp;&nbsp;") }}</span>
            <span v-if="hasChildren(item)" class="item__key">&lt;&sol;{{ item.key }}&gt;</span>
        </li>
    </ul>
</div>
</template>

<script>
import List from './List.vue'
export default {

    name: 'List',

    components: { List },

    props: {
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
            if (Array.isArray(value)) return value.join(', ')
            return value
        }
    },

    computed: {
        deeper () {
            return this.index += 1
        },
        style () {
            if (this.deep === 1) return {}
            return {'marginLeft': (8 * this.deeper) + 'px'}
        }
    }
}
</script>

<style lang="scss">
    @import '../../static/scss/_variables.scss';
    
    .list__wrapper {
        margin: 1em 0;
        padding: 0;
        background-color: rgba($main-color, .15);
    }

    .list {
        list-style-type: none;
        margin-left: 0;
        padding-left: 0;

        &[data-deep="1"] {
            margin: 0;
            padding: .5em 1em;

            & > li:nth-child(1) {
                padding: 0;
            }
        }

        .list__item {
            padding: 4px 15px;
            font-size: .95em;

            .item__key {
                color: rgba($dark-color, .9);
                font-weight: bold;
            }
            .item__value {
                color: rgba($dark-color, .7)
            }
        }
    }
</style>

