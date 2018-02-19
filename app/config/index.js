const re = /^(https?):\/\/(\S+):([0-9]+)$/
const appProtocol = process.env.APP_PROTOCOL || 'http'
const appPort = process.env.APP_PORT || 3000

let url = process.env.API_URL || null
let protocol = process.env.API_PROTOCOL || 'http'
let host = process.env.API_HOST || 'localhost'
let port = process.env.API_PORT || 8905

if (url && re.test(url)) [,protocol,host,port,] = url.match(re)

module.exports = {

    api: {
        protocol,
        host,
        port
    },

    app: {
        port: appPort,
        protocol: appProtocol
    },

    params: {
        basepath: process.env.CONF_PATH || '/etc/apache2/',
        availablesPath: process.env.CONF_AVAILABLES || 'sites-available/',
        enabledPath: process.env.CONF_ENABLED || 'sites-enabled/',
        extension: process.env.CONF_EXTENSION || '.conf'
    }

}