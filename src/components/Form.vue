<template>
    <div class="vh__form">
        <Loader v-show="loader" />
        <div class="toolbar">
            <router-link class="toolbar__link back__link" :to="{ name: 'vh.index' }">Retour</router-link>
        </div>
        <form class="form" @submit.prevent="handleSubmit">
            <h4>{{ title }}</h4>
            <div class="input-group">
                <label for="filename">Nom du fichier</label>
                <input type="text" name="filename" id="filename" v-model="item.filename" required>
            </div>
            <div class="input-group editor__field" :class="{'has__error': hasConfigError}">
                <label for="content">
                    <span>Contenu</span>
                    <button class="btn btn__prevContent" title="Annuler l'action (CTRL+Z)" @click.prevent="undo">
                        <Icon id="icon__undo" />
                    </button>
                    <button class="btn btn__nextContent" title="Refaire l'action" @click.prevent="redo">
                        <Icon id="icon__redo" />
                    </button>
                    <!-- <button v-if="configtest === null" class="btn" title="Tester la configuration" @click.prevent="getConfigtest"> -->
                        <Icon v-if="configtest === null" id="icon__zap" />
                    <!-- </button> -->
                    <span v-if="configtest === true" title="Configuration valide">
                        <Icon  id="icon__check" :class="'success-color'" />
                    </span>
                    <span v-if="hasConfigError" title="Erreur de configuration">
                        <Icon id="icon__cross" :class="'error-color'" />
                    </span>
                </label>
                <textarea name="content" id="content" cols="30" rows="10" ref="content" v-model="item.parsed" required></textarea>
                <span v-if="hasConfigError" class="content__error error-color ">{{ configtest }}</span>
                <span class="editor__helper">Rechercher: CTRL+F</span>
            </div>
            <div class="checkable-group">
                <input type="checkbox" name="enabled" id="enabled" v-model="item.enabled">
                <label for="enabled">Activer la configuration</label>
            </div>
            <div v-if="editing" class="checkable-group">
                <input type="checkbox" name="override" id="override" v-model="item.override">
                <label for="override">Ecraser la configuration existante</label>
            </div>
            <div v-if="editing" class="checkable-group">
                <input type="checkbox" name="comments" id="comments" v-model="item.comments">
                <label for="comments">Conserver les commentaires</label>
            </div>
            <div class="input-group">
                <button type="submit">Enregistrer</button>
            </div>
        </form>
    </div>
</template>

<script>
import CodeMirror from '../../node_modules/codemirror/lib/codemirror.js'
import '../../node_modules/codemirror/mode/xml/xml.js'
import '../../node_modules/codemirror/addon/search/search.js'
import '../../node_modules/codemirror/addon/search/searchcursor.js'
import '../../node_modules/codemirror/addon/search/jump-to-line.js'
import '../../node_modules/codemirror/addon/dialog/dialog.js'
import VHMaganer from '../app/VHMaganer'
import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'
import Loader from './Loader.vue'
import Icon from './Icon.vue'

export default {

    components: { Loader, Icon },

    data: function () {
        return {
            loader: true,
            item: {
                id: null,
                filename: null,
                parsed: null,
                enabled: false,
                comments: false,
                override: true
            },
            editor: null,
            editing: false,
            configtest: null,
            lineError: null
        }
    },

    methods: {

        async fetchItem () {
            try {
                const response = this.editing 
                    ? await VHMaganer.find(this.$route.params.id)
                    : await VHMaganer.getExample()

                this.item = {...this.item, ...response}
                this.initEditor(this.parsed)
            } catch (e) {
                this.$root.$emit('flash', { message: e })
            }
        },

        async handleSubmit (e) {
            e.preventDefault()
            this.loader = true
            this.configtest = null
            let { id, filename, enabled, override } = this.item

            const data = {
                id,
                filename,
                enabled,
                override,
                content: this.editor.getValue()
            }

            try {
                const response = this.editing 
                    ? await VHMaganer.update(id, data)
                    : await VHMaganer.store(data)

                if (override === false || !this.editing) {
                    this.$router.push({ name: 'vh.edit', params: { id: response.id } })
                    window.location.reload()
                }

                let message = 'VHost %s avec succès'
                let state = this.editing ? 'mis à jour' : 'créé'
                if (enabled) state = `${state} et activé`
                this.$root.$emit('flash', { message: message.replace('%s', state), type: 'success' })
            } catch (e) {
                this.configtest = e.message ? e.message : e
                this.lineError = VHMaganer.getLineError(this.configtest)
                if (this.lineError !== null) this.editor.addLineClass(this.lineError, 'wrap', 'error__bg')
            }
            this.loader = false
        },

        setContent (content, undo = false) {
            if (this.configtest !== null) this.configtest = null
            let { line, ch } = this.editor.getCursor()
            this.item.content = content
            if (this.lineError !== null) {
                this.editor.removeLineClass(this.lineError, 'wrap', 'error__bg')
                this.lineError = null
            }
            this.$nextTick(() => this.editor.setCursor(line, ch))
        },

        undo () { this.editor.undo() },

        redo () { this.editor.redo() },

        async getConfigtest () {
            this.loader = true
            try {
                this.configtest = await VHMaganer.configtest()
            } catch (e) {
                if (this.hasConfigError) {
                    this.lineError = VHMaganer.getLineError(e)
                    if (this.lineError !== null) this.editor.addLineClass(this.lineError, 'wrap', 'error__bg')
                }
            }
            this.loader = false
        },

        initEditor (value = '') {
            const textarea = this.$refs.content
            if (!textarea || !textarea.parentNode) return
            this.editor = CodeMirror(el => textarea.parentNode.replaceChild(el, textarea), {
                value,
                mode: "xml",
                theme: "dracula",
                tabSize: 8,
                lineNumbers: true
            })

            this.editor.on('keyup', debounce((_instance, obj) => this.setContent(_instance.getValue()), 300))
        },

        processParsed () {
            if (!this.item.content) return ''
            if (this.item.comments === true) return this.item.content
            return this.item.content
                .split("\n")
                .filter(item => item.trim().charAt(0) != '#')
                .join("\n")
        }

    },

    computed: {
        title () {
            const prefix = this.editing ? 'Editer' : 'Ajouter'
            return `${prefix} un VHost`
        },

        parsed () {
            return this.processParsed()
        },

        hasConfigError () {
            return this.configtest !== null && this.configtest !== true
        }
    },

    mounted () {
        this.editing = Boolean(this.$route.params.id !== undefined)
        this.fetchItem()
        this.loader = false

        this.$watch('item', throttle(({ comments }) => this.editor.setValue(this.parsed), 300), { deep: true })
    }
}
</script>

<style lang="scss">
    @import '../../node_modules/codemirror/lib/codemirror.css';
    @import '../../node_modules/codemirror/theme/dracula.css';
    @import '../../node_modules/codemirror/addon/search/matchesonscrollbar.css';
    @import '../../node_modules/codemirror/addon/dialog/dialog.css';
    @import '../../static/scss/_variables.scss';

    .vh__form {
        .CodeMirror {
            width: 100%;
            display: block;
            float: left;
            padding: 1em 0;
        }

        .form {
            float: left;
            display: block;
            width: 100%;
            padding: 0 2em 2em;

            .editor__field {
                position: relative;

                &.has__error .CodeMirror {
                    padding-bottom: 50px;

                    .CodeMirror-scroll {
                        overflow: hidden !important;
                    }
                }

                .error__bg {
                    background-color: $error-color;
                }
            }

            .editor__helper {
                display: block;
                float: right;
                height: 20px;
                line-height: 20px;
                padding: 0 .5em;
                font-size: .7em;
                color: rgba($text-color, .667);
                font-style: italic;
            }

            .content__error {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                top: auto;
                width: 100%;
                font-size: .85em;
                font-style: italic;
                height: 50px;
                margin: 0;
                padding: .25em 1em;
                background-color: transparent;
                transform: translateY(-20px);
                z-index: 100;
                overflow-y: auto;
            }

            .btn, .action__icon {
                width: 24px;
                height: 24px;
                line-height: 24px;
                vertical-align: middle;
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);

                &.btn__prevContent {
                    right: 48px;
                }

                &.btn__nextContent {
                    right: 24px;
                }
            }
        }
    }
</style>
