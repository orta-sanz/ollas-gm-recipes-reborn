const baseConfig = require('./webpack.config.base');

module.exports = {
    ...baseConfig,
    mode: 'development',
    devServer: {
        hot: true,
        watchOptions: {
            poll: true
        }
    }
};
