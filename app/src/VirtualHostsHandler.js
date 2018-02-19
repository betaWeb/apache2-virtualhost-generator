const glob = require('glob-promise')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const apacheconf = require('apacheconf')
const { copySync } = require('fs-extra')
const { userInfo } = require('os')
const { exec } = require('child_process')
const { error } = require('./Utils')

class VirtualHostsHandler {

    constructor (settings = {}) {
        this._availables = null
        this._enabled = null
        this._files = {}
        this.settings = {
            ...global.config.params,
            ...settings
        }
        this._commands = {
            chmod: 'sudo chmod %m %s;',
            chown: 'sudo chown %u:%u %s;',
            apacheReload: 'sudo service apache2 reload;',
            configtest: 'apachectl configtest;',
            enableSite: 'cd %d; sudo a2ensite %s;',
            disableSite: 'cd %d; sudo a2dissite %s;',
            create: 'sudo touch %i;',
            copy: 'sudo cp %i %o;',
            move: 'sudo mv %i %o;',
            remove: 'sudo rm %i;',
        }
        this._init()
    }

    async _init () {
        this.paths = {
            available: path.join(this.settings.basepath, this.settings.availablesPath),
            enabled: path.join(this.settings.basepath, this.settings.enabledPath)
        }
        await this.updateList()
        this._enabled = (await this.enabledList()).map(item => path.basename(item))
    }

    async updateList () {
        this._availables = await this.availablesList()
    }

    async all () {
        try {
            let data = []
            await this.updateList()
            this._availables.forEach(item => data.push(this._datum(item)))
            return data
        } catch (e) {
            throw e
        }
    }

    async find (id) {
        try {
            if (!this.fileExists(id)) throw new Error('ERR_NO_FILE')
            return await this.getFileInfo(id)
        } catch (e) {
            throw e
        }
    }

    async store ({ filename, content, enabled }) {
        try {
            filename = this._setExtension(filename)
            const id = this._toId(filename)
            const filePath = path.join(this.paths.available, filename)
            try {
                fs.lstatSync(filePath)
            } catch (e) {
                if (e.code !== 'ENOENT') throw 'ERR_ALREADY_EXISTS'
            }
            await this._writeFile(filePath, content, null, false)
            await this._chown(filePath)
            await this._chmod(filePath)
            this._availables.push(filePath)
            if (enabled === true) await this.enableConfig(id)
            await this.updateList()
            return await this.getFileInfo(id)
        } catch (e) {
            throw e
        }
    }

    async update (id, data) {
        try {
            let oldFilePath = null
            let newFilename = this._setExtension(data.filename)
            let { filePath, filename } = await this.getFileInfo(id)
            let newFile = false
            if (data.override === true) {
                if (newFilename !== filename) {
                    oldFilePath = filePath
                    filePath = path.join(path.dirname(filePath), newFilename)
                }
            } else {
                newFile = true
                if (newFilename === filename) newFilename = this._overrideFilename(newFilename)
                filePath = path.join(path.dirname(filePath), newFilename)
            }
            await this._writeFile(filePath, data.content, oldFilePath, data.override)
            await this.enableConfig(id)
            let test = await this.configtest()
            if (data.enabled !== true && this._isEnabled(filename)) await this.disableConfig(id)
            if (test !== true) throw test
            if (newFile) id = this._toId(newFilename)
            await this.updateList()
            await this._updateFileInfo(id)
            return await this.getFileInfo(id)
        } catch (e) {
            throw e
        }
    }

    async duplicate (id) {
        try {
            const { filePath, filename } = await this.getFileInfo(id)
            const outputFilename = this._overrideFilename(filename)
            const outputFilePath = path.join(path.dirname(filePath), outputFilename)
            const outputId = this._toId(outputFilename)
            await this._execCommand('copy', { 'i': filePath, 'o': outputFilePath })
            await this.updateList()
            return await this.getFileInfo(outputId)
        } catch (e) {
            throw e
        }
    }

    async destroy (id) {
        try {
            let { filePath, filename } = await this.getFileInfo(id)
            if (this._isEnabled(filename)) await this.disableConfig(id)
            return await this._execCommand('remove', { 'i': filePath })
        } catch (e) {
            throw e
        }
    }

    async enableConfig (id) {
        if (!this.fileExists(id)) throw 'ERR_NO_FILE'
        const { filePath, filename } = await this.getFileInfo(id)
        if (this._isEnabled(filename)) return true
        
        try {
            await this._execCommand('enableSite', { 'd': path.dirname(filePath), 's': filename })
            if (!this._isEnabled(filename)) this._enabled.push(filename)
            return await this._reloadApache()
        } catch (e) {
            throw e
        }
    }

    async disableConfig (id) {
        if (!this.fileExists(id)) throw 'ERR_NO_FILE'
        const { filePath, filename } = await this.getFileInfo(id)
        if (!this._isEnabled(filename)) return true
        
        try {
            await this._execCommand('disableSite', { 'd': path.dirname(filePath), 's': filename })
            this._enabled = this._enabled.filter(item => item !== filename)
            return await this._reloadApache()
        } catch (e) {
            throw e
        }
    }

    async availablesList () {
        return await glob(path.join(this.paths.available, '/**/*.conf'), { nobrace: true })
    }

    async enabledList () {
        return await glob(path.join(this.paths.enabled, '/**/*.conf'))
    }

    async configtest () {
        const { stderr } = await this._execCommand('configtest')
        if (/syntax ok/ig.test(stderr)) return true
        return stderr.message
    }

    fileExists (id) {
        return Boolean(this._availables.find(item => this._toId(path.basename(item)) == id).length > 0)
    }

    hasFileInfo (id) {
        return this._files.hasOwnProperty(id)
    }

    async getFileInfo (id) {
        if (!this.hasFileInfo(id)) await this._updateFileInfo(id)
        return this._files[id]
    }

    async _updateFileInfo (id) {
        const filePath = this._availables.find(item => this._toId(path.basename(item)) == id)
        let content = fs.readFileSync(filePath, 'utf-8')
        let parsed = await this._parseContent(filePath)
        this.setFileInfo(id, { ...this._datum(filePath),  ...{ content, parsed } })
    }

    setFileInfo (id, content = {}) {
        this._files[id] = content
    }

    async _writeFile (filePath, content, oldFilePath = null, override = true) {
        try {
            if (oldFilePath !== null) {
                this._unlinkFile(oldFilePath)
            }
            if (!override) await this._execCommand('create', { 'i': filePath })
            await this._chown(filePath)
            await this._chmod(filePath)
            fs.writeFileSync(filePath, content, { encoding:'utf8', flag:'w', mode: 0o777 })
        } catch (e) {
            throw new Error(e)
        }
    }

    async _unlinkFile (filePath) {
        try {
            await this._chown(filePath)
            await this._chmod(filePath)
            fs.unlinkSync(filePath)
        } catch (e) {
            throw new Error(e)
        }
    }

    async _parseContent (filePath) {
        return new Promise((resolve, reject) => {
            try {
                apacheconf(filePath, (err, config, parser) => {
                    if (err) reject(err)
                    else resolve(this._processParsedResult(config))
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    async _execCommand (command, args = null) {
        if (Object.keys(this._commands).includes(command))
            command = this._commands[command]

        if (args && args.constructor === Object) {
            command = command.replace(
                new RegExp('\%' + Object.keys(args).join('|\%'), 'g'),
                m => args[m.substr(1)]
            )
        }
        return new Promise((resolve, reject) => {
            try {
                exec(command, (err, stdout, stderr) => {
                    if (err) resolve({ stderr: err })
                    else resolve({ stdout, stderr })
                })
            } catch (e) {
                reject(e)
            }
        })
    }

    _processParsedResult (result) {
        let data = []
        for (let key in result) {
            if (key != '$args') {
                let value = result[key]
                let datum = {
                    key,
                    value: null,
                    _children: []
                }
                let [val, ] = value
                if (value.length && val.constructor === Object) {
                    if (val['$args']) datum.value = val['$args']
                    datum._children = this._processParsedResult(val)
                } else {
                    datum.value = value
                    delete datum._children
                }
    
                data.push(datum)
            }
        }

        return data
    }

    _datum (filePath, id = null) {
        let datum = {
            id: 0,
            filePath,
            filename: path.basename(filePath),
            enabled: false
        }

        datum.id = id 
            ? id 
            : this._toId(datum.filename)

        if (this._isEnabled(datum.filename))
            datum.enabled = path.join(this.settings.basepath, this.settings.enabledPath, datum.filename)

        return datum
    }

    _isEnabled (filename) {
        return Boolean(this._enabled.includes(filename))
    }

    _toId (str) {
        return crypto.createHash('md5').update(str).digest('hex')
    }

    _setExtension (filename) {
        if (path.extname(filename) !== this.settings.extension) filename += this.settings.extension
        return filename
    }

    _overrideFilename (filename) {
        const matches = filename.match(/^([0-9]{1,})(\_\_[0-9]+)?\-(\S+)(.conf)$/)
        if (!matches || !matches.length) return filename
        const prefix = matches[1]
        let name = matches[3]
        let ext = matches[4]
        return `${prefix}__${+new Date}-${name}${ext}`
    }

    async _chmod (filePath, mode = '0755') {
        await this._execCommand('chmod', { 'm': mode.toString(), 's': filePath })
    }

    async _chown (filePath) {
        const uname = userInfo.username || '$USER'
        const cmd = this._commands.chown
            .replace(/%u/g, uname)
            .replace('%s', filePath)
        await this._execCommand(cmd)
    }

    async _reloadApache () {
        try {
            return await this._execCommand('apacheReload')
        } catch (e) {
            error(e, 'VirtualHostsHandler._reloadApache')
            throw new Error(e)
        }
    }

}

module.exports = VirtualHostsHandler