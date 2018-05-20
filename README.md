[![npm version](https://badge.fury.io/js/karma-summary-reporter.svg)](http://badge.fury.io/js/karma-summary-reporter)
[![Build Status](https://travis-ci.org/dgarlitt/karma-summary-reporter.svg)](https://travis-ci.org/dgarlitt/karma-summary-reporter)
[![Coverage Status](https://coveralls.io/repos/dgarlitt/karma-summary-reporter/badge.svg?branch=master)](https://coveralls.io/r/dgarlitt/karma-summary-reporter?branch=master)
[![Dependency Status](https://david-dm.org/dgarlitt/karma-summary-reporter.svg)](https://david-dm.org/dgarlitt/karma-summary-reporter)

karma-summary-reporter
======================

[![Greenkeeper badge](https://badges.greenkeeper.io/prantlf/karma-brief-reporter.svg)](https://greenkeeper.io/)

The summary reporter originated with a similar idea behind the [Nyan Cat reporter] - do not print information about every successful test or failing test immediately, like the [Mocha reporter] does it. Print only test count statistics during the test run and summary about failing tests at the end. Unlike the Nyan Cat reporter, this reporter prints the progress statistics on one line only. It takes less space and if the terminal application prevents moving the cursor up, the screen is not covered by garbage.

Examples
--------

A successful test run:

```txt
   65 total     57 passed      0 failed      8 skipped
```

A test run, which ended with a runtime error at the very beginning, because a code module has been missing:

```txt
    0 total      0 passed      0 failed      0 skipped

HeadlessChrome 0.0.0 (Linux 0.0.0)

Error: Script error for "jquery", needed by: /base/tests/main.spec.js
http://requirejs.org/docs/errors.html#scripterror
    at makeError (http://localhost:9876/base/node_modules/requirejs/require.js?242a935a7049803efaaa891de70075a8d6432d9b:168:17)
    at HTMLScriptElement.onScriptError (http://localhost:9876/base/node_modules/requirejs/require.js?242a935a7049803efaaa891de70075a8d6432d9b:1738:36)
```

A test run, which ended with one test failure:

```txt
   65 total     56 passed      1 failed      8 skipped

Failed Tests:
 main page
    renders page loading time
       HeadlessChrome 0.0.0 (Linux 0.0.0)
          1) Expected '0' to equal '2'.
             at UserContext.<anonymous> (tests/main.spec.js:78:67)
```

The real console output is colourful.

Installation
------------

Installation is simple using npm, just run the following command:

```sh
npm install --save-dev karma-summary-reporter
```

Since this follows Karma's plugin naming convention, that's all there is to it!

Now, run your tests and enjoy:

```sh
karma start path/to/karma.conf.js --reporters summary
```

Options
-------

If you want to suppress various output parts, flip the corresponding `suppress*` flag in the reporter options.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    // Choose the reporter
    reporters: ['summary'],

    // Reporter options
    summaryReporter: {
      // Suppress the error report at the end of the test run.
      suppressErrorReport: true, // default is false

      // Suppress the red background on errors in the error
      // report at the end of the test run.
      suppressErrorHighlighting: true, // default is false

      // Suppress the browser console log at the end of the test run.
      suppressBrowserLogs: true, // default is false

      // Only render the graphic after all tests have finished.
      // This is ideal for using this reporter in a continuous
      // integration environment.
      renderOnRunCompleteOnly: true // default is false
    }
  });
};
```

Contributing
------------

In lieu of a formal styleguide, take care to maintain the existing coding style.  Add unit tests for any new or changed functionality. Lint and test your code using the npm script commands.

License
-------

Copyright (c) 2018 Ferdinand Prantl

Licensed under the MIT license.

[Nyan Cat reporter]: https://github.com/prantlf/karma-nyan-reporter
[Mocha reporter]: https://github.com/litixsoft/karma-mocha-reporter
