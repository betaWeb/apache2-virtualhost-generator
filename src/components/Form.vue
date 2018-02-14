<template>
    <div>
        <div class="toolbar">
            <router-link class="toolbar__link back__link" :to="{ name: 'vh.index' }">Retour</router-link>
        </div>
        <form class="form" action="/api/vh/add" @submit="handleSubmit">
            <h4>{{ title }}</h4>
            <div class="input-group">
                <label for="filename">Nom du fichier</label>
                <input type="text" name="filename" id="filename" v-model="item.filename">
            </div>
            <div class="input-group">
                <label for="content">Contenu</label>
                <textarea name="content" id="content" cols="30" rows="10" v-model="item.content" :value="parsed" ref="content" @keyup.prevent="setContent"></textarea>
            </div>
            <div class="input-group">
                <label for="enabled">Activé ?</label>
                <input type="checkbox" name="enabled" id="enabled" v-model="item.enabled">
            </div>
        </form>
    </div>
</template>

<script>
import VHMaganer from '../app/VHMaganer'

export default {

    data: function () {
        return {
            loader: true,
            item: {
                id: null,
                filename: null,
                parsed: null,
                enabled: false
            },
            editing: false
        }
    },

    methods: {

        fetchItem: async function () {
            this.item = await VHMaganer.find(this.$route.params.id)
            this.loader = false
        },

        handleSubmit: function (e) {
            e.preventDefault()
            console.log(e.target.action)
        },

        setContent: function (e) {
            this.item.content = e.target.value
            console.log(this.item.content)
        },
        
        enableTab: function () {
            var el = this.$refs.content
            if (!el) return
            el.onkeydown = function(e) {
                if (e.keyCode !== 9) return
                let val = this.value
                let start = this.selectionStart
                let end = this.selectionEnd

                this.value = val.substring(0, start) + '\t' + val.substring(end)
                this.selectionStart = this.selectionEnd = start + 1
                return false
            }
        }

    },

    computed: {
        title () {
            const prefix = this.editing ? 'Editer' : 'Ajouter'
            return `${prefix} un VHost`
        },

        parsed () {
            if (!this.item.content) return ''
            let parsed = this.item.content
                .split("\n")
                .filter(item => item.trim() != '')
                .filter(item => item.trim().charAt(0) != '#')
                .join("\n")
            return parsed
        }
    },

    mounted () {
        this.editing = Boolean(this.$route.params.id !== undefined)
        if (this.editing) this.item = this.fetchItem()
        this.enableTab()
    }
}
</script>

<style lang="scss">
    .form {
        padding: 0 2em;
    }
</style>
