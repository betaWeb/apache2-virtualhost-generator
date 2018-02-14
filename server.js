const express = require('express')
const cors = require('cors')
const config = require('./app/config')
const VirtualHostsHandler = require('./app/src/VirtualHostsHandler')
const app = express()
const vh = new VirtualHostsHandler

app.use(cors())

app.post('/api/vh/all', async (req, res) => {
    const list = await vh.all()
    res.json(list)
})
app.post('/api/vh/:id/show', async (req, res) => {
    const item = await vh.find(req.params.id)
    return res.json(item)
})

app.listen(config.app.port, () => console.log(`App started on http://localhost:${config.app.port}`))