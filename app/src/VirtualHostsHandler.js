const glob = require('glob-promise')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const apacheconf = require('apacheconf')
const { userInfo } = require('os')
const { exec } = require('child_process');

// const filesRegexp = '([0-9]{3,}-)(.*)(.conf)'
const DEFAULT_SETTINGS = {
    extension: '.conf',
    availablesPath: 'sites-available/',
    enabledPath: 'sites-enabled/',
    commands: {
        chmod: 'sudo chmod %m %s;',
        chown: 'sudo chown %u:%u %s;',
        apacheReload: 'sudo service apache2 reload;',
        configtest: 'apachectl configtest;',
        enableSite: 'cd %d; sudo a2ensite %s;',
        disableSite: 'cd %d; sudo a2dissite %s;'
    }
}

class VirtualHostsHandler {

    constructor (basepath = "/etc/apache2/", settings = {}) {
        this._availables = null
        this._enabled = null
        this._files = {}
        this.basepath = basepath
        this.settings = {
            ...DEFAULT_SETTINGS,
            ...settings
        }
        this.init()
    }

    async init () {
        this.paths = {
            available: path.join(this.basepath, this.settings.availablesPath),
            enabled: path.join(this.basepath, this.settings.enabledPath)
        }
        this._availables = await this.availablesList()
        this._enabled = (await this.enabledList()).map(item => path.basename(item))
    }

    async all () {
        try {
            let data = []
            this._availables.forEach(item => data.push(this._datum(item)))
            return data
        } catch (e) {
            this._logError('all', e)
            throw new Error(e)
        }
    }

    async find (id) {
        try {
            if (!this.fileExists(id)) throw new Error('ERR_NO_FILE')
            return await this.getFileInfo(id)
        } catch (e) {
            this._logError('find', e)
            throw new Error(e)
        }
    }

    async store ({ filename, content, enabled }) {
        try {
            filename = this._setExtension(data.filename)
            const id = this._toId(filename)
            const filePath = path.join(this.paths.available, filename)
            await this._writeFile(filePath, content)
            this._availables.push(filePath)
            if (enabled === true) await this.enableConfig(id)
            return true
        } catch (e) {
            this._logError('store', e)
            throw new Error(e)
        }
    }

    async update (id, data) {
        try {
            let oldFilePath = null
            const newFilename = this._setExtension(data.filename)
            const { filePath, filename } = await this.getFileInfo(id)
            if (newFilename !== filename) {
                oldFilePath = filePath
                filePath = path.join(path.dirname(filePath), newFilename)
            }
            await this._writeFile(filePath, data.content, oldFilePath)
            if (data.enabled === true) await this.enableConfig(id)
            await this._updateFileInfo(id)
            return true
        } catch (e) {
            this._logError('update', e)
            throw new Error(e)
        }
    }

    async enableConfig (id) {
        if (!this.fileExists(id)) throw 'ERR_NO_FILE'
        const { filePath, filename } = await this.getFileInfo(id)
        if (this._isEnabled(filename)) return true
        const cmd = this.settings.commands.enableSite
            .replace('%d', path.dirname(filePath))
            .replace('%s', filename)
        
        try {
            const result = await this._execCommand(cmd)
            if (!this._isEnabled(filename)) this._enabled.push(filename)
            return await this._reloadApache()
        } catch (e) {
            this._logError('enableConfig', e)
            throw new Error(e)
        }
    }

    async disableConfig (id) {
        if (!this.fileExists(id)) throw 'ERR_NO_FILE'
        const { filePath, filename } = await this.getFileInfo(id)
        if (!this._isEnabled(filename)) return true
        const cmd = this.settings.commands.disableSite
            .replace('%d', path.dirname(filePath))
            .replace('%s', filename)
        
        try {
            const result = await this._execCommand(cmd)
            this._enabled = this._enabled.filter(item => item !== filename)
            return await this._reloadApache()
        } catch (e) {
            this._logError('disableConfig', e)
            throw new Error(e)
        }
    }

    async availablesList () {
        return await glob(path.join(this.paths.available, '/**/*.conf'), { nobrace: true })
    }

    async enabledList () {
        return await glob(path.join(this.paths.enabled, '/**/*.conf'))
    }

    async configtest () {
        const { stderr } = await this._execCommand(this.settings.commands.configtest)
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
        if (!this.hasFileInfo(id)) {
            await this._updateFileInfo(id)
        }
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

    async _writeFile (filePath, content, oldFilePath = null) {
        try {
            const { chmod, chown } = this.settings.commands
            if (oldFilePath !== null) {
                await this._chown(oldFilePath)
                await this._chmod(oldFilePath)
                fs.unlinkSync(oldFilePath)
            }
            await this._chown(filePath)
            await this._chmod(filePath)
            fs.writeFileSync(filePath, content, { encoding:'utf8', flag:'w' })
        } catch (e) {
            throw new Error(`[ERR] VirtualHostsHandler._writeFile - ${e}`)
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

    async _execCommand (command) {
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
            datum.enabled = path.join(this.basepath, this.settings.enabledPath, datum.filename)

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

    _logError(methodName, err) {
        console.error(`\n[ERR] VirtualHostsHandler.${methodName} - ${err.stack}\n`)
    }

    async _chmod (filePath, mode = 777) {
        const cmd = this.settings.commands.chmod
            .replace('%m', mode.toString())
            .replace('%s', filePath)
        await this._execCommand(cmd)
    }

    async _chown (filePath) {
        const cmd = this.settings.commands.chown
            .replace(/%u/g, userInfo.username)
            .replace('%s', filePath)
        await this._execCommand(cmd)
    }

    async _reloadApache () {
        try {
            return await this._execCommand(this.settings.commands.apacheReload)
        } catch (e) {
            this._logError('_reloadApache', e)
            throw new Error(e)
        }
    }

}

module.exports = VirtualHostsHandler