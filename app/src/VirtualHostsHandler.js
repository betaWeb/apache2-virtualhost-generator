const glob = require('glob-promise')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const apacheconf = require('apacheconf')

// const filesRegexp = '([0-9]{3,}-)(.*)(.conf)'
const DEFAULT_SETTINGS = {
    availablesPath: 'sites-available/',
    enabledPath: 'sites-enabled/'
}

class VirtualHostsHandler {

    constructor (basepath = "/etc/apache2/", settings = {}) {
        this._availables = null
        this._enabled = null
        this.basepath = basepath
        this.settings = {
            ...DEFAULT_SETTINGS,
            ...settings
        }
        this.init()
    }

    async init () {
        this.paths = {
            available: path.join(this.basepath, this.settings.availablesPath, '/**/*.conf'),
            enabled: path.join(this.basepath, this.settings.enabledPath, '/**/*.conf')
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
            throw new Error(e)
        }
    }

    async find (id) {
        const filePath = this._availables.find(item => this._toId(path.basename(item)) == id)
        try {
            let content = fs.readFileSync(filePath, 'utf-8')
            let parsed = await this._parseContent(filePath)

            return {
                ...this._datum(filePath), 
                ...{ content, parsed }
            }
        } catch (e) {
            console.error(e)
            throw 'ERR_NO_RESULT'
        }
    }

    async availablesList () {
        return await glob(this.paths.available, { nobrace: true })
    }

    async enabledList () {
        return await glob(this.paths.enabled)
    }

    async _parseContent (filePath, cb) {
        return new Promise((resolve, reject) => {
            try {
                apacheconf(filePath, (err, config, parser) => {
                    if (err) reject(err)
                    else {
                        const result = this._processParsedResult(config)
                        console.log(JSON.stringify(result))
                        resolve(result)
                    }
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
                if (value.length && value[0].constructor === Object) {
                    if (value[0]['$args']) datum.value = value[0]['$args']
                    datum._children = this._processParsedResult(value[0])
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
            path: filePath,
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

    async _isEnabled (filename) {
        return Boolean(this._enabled.includes(filename))
    }

    _toId (str) {
        return crypto.createHash('md5').update(str).digest('hex')
    }

}

module.exports = VirtualHostsHandler