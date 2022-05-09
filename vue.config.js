const path = require('path')
module.exports = {
    publicPath: './',
    filenameHashing: false,
    chainWebpack: (config)=> {
        config.entry('manifest').add(path.join(__dirname, 'public/manifest.json')).end();
        config.entry('index').add(path.join(__dirname, 'public/js/index.js')).end();
    }
}
