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
            throw new Error(`[Err] VHMaganer.find - ${e}`)
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

}