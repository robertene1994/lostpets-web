const config = require('./protractor.conf').config;

config.capabilities = {
    browserName: 'chrome',
    binary: require('puppeteer').executablePath(),
    chromeOptions: {
        args: ['--headless', '--no-sandbox', '--disable-gpu'],
    },
};

exports.config = config;
