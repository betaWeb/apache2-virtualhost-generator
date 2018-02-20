require('dotenv').config()

global.config = require('./app/config')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { readFileSync } = require('fs')
const VirtualHostsHandler = require('./app/src/VirtualHostsHandler')
const { success, error } = require('./app/src/Utils')
const api = express()
const vh = new VirtualHostsHandler
const env = process.env.APP_ENV || 'development'

api.use(cors())
api.use(bodyParser.json())
api.use(bodyParser.urlencoded({ extended: true }))
api.use((req, res, next) => {
    if (!res.hasOwnProperty('hasError'))
        res.finish = json => res.status(json.status).json(json)
    next()
})

api.post('/api/vh/all', async (req, res) => {
    let json = {}
    try {
        const response = await vh.all()
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.get('/api/vh/example', (req, res) => {
    try {
        const content = readFileSync('app/resources/conf.example', 'utf-8')
        json = success({ content })
    } catch (e) {
        json = error(e)        
    }
    return res.finish(json)
})
api.post('/api/vh/:id/show', async (req, res) => {
    let json = {}
    try {
        const response = await vh.find(req.params.id)
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.post('/api/vh/configtest', async (req, res) => {
    let json = {}
    try {
        const response = await vh.configtest()
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.get('/api/vh/:id/download', async (req, res) => {
    const { filePath, filename } = await vh.find(req.params.id)
    res.set({
        'Content-type': 'text/plain',
        'Content-disposition': `attachment; filename=${filename}`
    })
    res.download(filePath, filename)
})
api.post('/api/vh/store', async (req, res) => {
    let json = {}
    try {
        const response = await vh.store(req.body)
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.put('/api/vh/:id/update', async (req, res) => {
    let json = {}
    try {
        const response = await vh.update(req.params.id, req.body)
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.put('/api/vh/:id/duplicate', async (req, res) => {
    let json = {}
    try {
        const response = await vh.duplicate(req.params.id)
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.delete('/api/vh/:id/destroy', async (req, res) => {
    let json = {}
    try {
        const response = await vh.destroy(req.params.id)
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.put('/api/vh/:id/enable', async (req, res) => {
    let json = {}
    try {
        const response = await vh.enableConfig(req.params.id)
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})
api.put('/api/vh/:id/disable', async (req, res) => {
    let json = {}
    try {
        const response = await vh.disableConfig(req.params.id)
        json = success(response)
    } catch (e) {
        json = error(e)
    }
    return res.finish(json)
})

api.listen(config.api.port, () => console.log(`API started on ${config.api.protocol}://${config.api.host}:${config.api.port}`))

if (env === 'production' && process.env.API_ONLY != true) {
    const app = express()
    app.use(express.static(__dirname + '/dist/'));
    app.get('/', (req, res) => res.sendFile(__dirname + '/dist/index.html'))
    app.listen(config.app.port, () => console.log(`App started on ${config.app.protocol}://localhost:${config.app.port}`))
}