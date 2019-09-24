module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      'src/**/*.js',
      'test/mocha/**/*.js'
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
