const { SpecReporter } = require('jasmine-spec-reporter');

/**
 * @type { import("protractor").Config }
 */
exports.config = {
    allScriptsTimeout: 11000,
    specs: [
        './src/**/*.e2e-spec.ts'
    ],
    capabilities: {
        browserName: 'chrome',
        binary: require('puppeteer').executablePath(),
        chromeOptions: {
            args: ['--headless', '--no-sandbox', '--disable-gpu'],
        },
    },
    directConnect: true,
    baseUrl: 'http://localhost:4200/',
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 180000,
        print: function() {}
    },
    onPrepare() {
        require('ts-node').register({
            project: require('path').join(__dirname, './tsconfig.json')
        });
        jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
        browser.driver.manage().window().maximize();
    }
};
