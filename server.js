const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const config = require('./app/config')
const VirtualHostsHandler = require('./app/src/VirtualHostsHandler')
const app = express()
const vh = new VirtualHostsHandler

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/api/vh/all', async (req, res) => {
    const list = await vh.all()
    res.json(list)
})
app.post('/api/vh/:id/show', async (req, res) => {
    const item = await vh.find(req.params.id)
    return res.json(item)
})
app.post('/api/vh/configtest', async (req, res) => {
    const response = await vh.configtest()
    return res.json({ response })
})
app.get('/api/vh/:id/download', async (req, res) => {
    const { path, filename } = await vh.find(req.params.id)
    res.set({
        'Content-type': 'text/plain',
        'Content-disposition': `attachment; filename=${filename}`
    })
    res.download(path, filename)
})
app.post('/api/vh/store', async (req, res) => {
    const response = await vh.store(req.body)
    return res.json({ response })    
})
app.put('/api/vh/:id/update', async (req, res) => {
    const response = await vh.update(req.params.id, req.body)
    return res.json({ response }) 
})
app.put('/api/vh/:id/enable', async (req, res) => {
    try {
        const response = await vh.enableConfig(req.params.id)
        return res.json({ response })
    } catch (e) {
        return res.status(500).json({ error: e.message })
    }
})
app.put('/api/vh/:id/disable', async (req, res) => {
    try {
        const response = await vh.disableConfig(req.params.id)
        return res.json({ response })
    } catch (e) {
        return res.status(500).json({ error: e.message })
    }
})

app.listen(config.app.port, () => console.log(`App started on http://localhost:${config.app.port}`))