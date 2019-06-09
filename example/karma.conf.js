module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],
    reporters: ['brief'],
    browsers: ['ChromeDebugging', 'FirefoxHeadless'],
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [ '--remote-debugging-port=9333' ]
      }
    }
  })
}