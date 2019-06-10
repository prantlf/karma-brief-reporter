module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'src/**/*.js',
      'test/jasmine/**/*.js'
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
        flags: [ '--remote-debugging-port=9333' ]
      }
    }
  })
}
