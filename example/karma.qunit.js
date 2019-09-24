module.exports = function (config) {
  config.set({
    frameworks: ['qunit'],
    files: [
      'src/**/*.js',
      'test/qunit/**/*.js'
    ],
    reporters: ['brief'],
    briefReporter: {
      omitExternalStackFrames: true,
      suppressBrowserLogs: true
    },
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9333']
      }
    }
  })
}
