module.exports = {

    success (data = {}) {
        return { err: null, data, status: 200 }
    },

    error (err = 'SOMETHING_WENT_WRONG', context = '') {
        let stack = null
        if (err.constructor === Object) {
            stack = err.stack
            err = err.message
        }
        err = `ERR::${err}`
        if (context.length) err = `${err} ~ ${context}`
        console.error(err, stack)
        return { err, context, data: null, status: 500 }
    }

}