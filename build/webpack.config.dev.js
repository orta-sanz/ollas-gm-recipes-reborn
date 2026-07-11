const baseConfig = require('./webpack.config.base');

module.exports = {
    ...baseConfig,
    mode: 'development',
    watchOptions: {
        poll: true
    },
    devServer: {
        hot: true
    }
};
