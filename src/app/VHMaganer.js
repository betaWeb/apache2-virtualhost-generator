import config from '../../app/config'

export default class VHMaganer {

    static defaultHeaders = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    static pathFor (path = '') {
        return `http://localhost:${config.app.port}/${path}`
    }

    static async all () {
        try {
            const response = await VHMaganer.fetchAPI('api/vh/all', { method: 'POST' })
            return response.json()
        } catch (e) {
            throw new Error(`[Err] VHMaganer.all - ${e}`)
        }
    }

    static async find (id) {
        try {
            const response = await VHMaganer.fetchAPI(`api/vh/${id}/show`, { method: 'POST' })
            return response.json()
        } catch (e) {
            throw new Error(`[Err] VHMaganer.find - item ${id} - ${e}`)
        }
    }

    static async store (data) {
        try {
            const response = await VHMaganer.fetchAPI('api/vh/store', { method: 'POST', body: JSON.stringify(data) })
            return response.json()
        } catch (e) {
            throw new Error(`[Err] VHMaganer.store - ${e}`)
        }        
    }

    static async update (id, data) {
        try {
            const response = await VHMaganer.fetchAPI(`api/vh/${id}/update`, { method: 'PUT', body: JSON.stringify(data) })
            return response.json()
        } catch (e) {
            throw new Error(`[Err] VHMaganer.update - item ${id} - ${e}`)
        }
    }

    static async enableConfig (id) {
        try {
            const response = await VHMaganer.fetchAPI(`api/vh/${id}/enable`, { method: 'PUT' })
            return response.json()
        } catch (e) {
            throw new Error(`[Err] VHMaganer.enableConfig - item ${id} - ${e}`)
        }
    }

    static async disableConfig (id) {
        try {
            const response = await VHMaganer.fetchAPI(`api/vh/${id}/disable`, { method: 'PUT' })
            return response.json()
        } catch (e) {
            throw new Error(`[Err] VHMaganer.disableConfig - item ${id} - ${e}`)
        }
    }

    static async download (id) {
        if (!id) return
        try {
            window.open(VHMaganer.pathFor(`api/vh/${id}/download`))
        } catch (e) {
            throw new Error(`[Err] VHMaganer.download - item ${id} - ${e}`)
        }
    }

    static async configtest () {
        try {
            const response = await VHMaganer.fetchAPI(`api/vh/configtest`, { method: 'POST' })
            return response.json()
        } catch (e) {
            throw new Error(`[Err] VHMaganer.configtest - ${e}`)
        }
    }

    static async fetchAPI (path, options, headers = {}) {
        const defaultOptions = {
            headers: VHMaganer.setRequestHeaders(headers),
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        }
        return await fetch(VHMaganer.pathFor(path), {
            ...defaultOptions, ...options
        })
    }

    static setRequestHeaders (headers = {}) {
        headers = {...VHMaganer.defaultHeaders, ...headers}
        const h = new Headers()
        if (Object.keys(headers).length) {
            for (let k in headers) {
                h.append(k, headers[k])
            }
        }

        return h
    }

    static getLineError (error = null) {
        let line = null
        if (error && error.length) {
            const matches = error.replace(/(\r\n|\n|\r)/gm,"").match(/^.* line ([0-9]{1,}) .*$/i)
            if (matches && matches.length) {
                line = parseInt(matches[1], 10) - 1
                isNaN(line) && (line = null)
            }
        }
        return line
    }

}