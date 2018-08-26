// vue.config.js
module.exports = {
    // options...
    baseUrl: process.env.NODE_ENV === 'production'
        // ? '/jconj/'
        ? '/jconj/'
        : '/',
    
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            // https://github.com/mishoo/UglifyJS2/tree/harmony#minify-options
            // config.optimization.minimizer = []; // disable UglifyJs for debugging
        }
    }
}