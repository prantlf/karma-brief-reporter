karma-brief-reporter
====================

[![Latest version](https://img.shields.io/npm/v/karma-brief-reporter)
 ![Dependency status](https://img.shields.io/librariesio/release/npm/karma-brief-reporter)
](https://www.npmjs.com/package/karma-brief-reporter)

The brief reporter originated with a similar idea behind the [Nyan Cat reporter] - do not print information about every successful test or failing test immediately, like the [Mocha reporter] does it. Print only test count statistics during the test run and summary about failing tests at the end. Unlike the Nyan Cat reporter, this reporter prints the progress statistics on one line only. It takes less space and if the terminal application prevents moving the cursor up, the screen is not covered by garbage.

- [Examples](#xamples)
- [Installation](#installation)
- [Options](#options)
- [Notes](#notes)
- [Contributing](#contributing)
- [License](#license)

![Demo](https://raw.githubusercontent.com/prantlf/karma-brief-reporter/master/demo.gif)

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
    at makeError (node_modules/requirejs/require.js:168:17)
    at HTMLScriptElement.onScriptError (node_modules/requirejs/require.js:1738:36)
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
npm install --save-dev karma-brief-reporter
```

Since this follows Karma's plugin naming convention, that's all there is to it!

Now, run your tests and enjoy:

```sh
karma start path/to/karma.conf.js --reporters brief
```

Options
-------

If you want to suppress various output parts, flip the corresponding `suppress*` flag in the reporter options.

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    // Choose the reporter
    reporters: ['brief'],

    // Reporter options
    briefReporter: {
      // Suppress the error report at the end of the test run.
      suppressErrorReport: true, // default is false

      // Print the test failures immediately instead of at the end.
      // The brief summary is updated on the last line. If this
      // is set to true, suppressErrorReport must be set to false.
      // Enable this, if you want to watch the failed test names
      // and descriptions and break the test run, when you want.
      earlyErrorReport: true, // default is false

      // Suppress the red background on errors in the error
      // report at the end of the test run.
      suppressErrorHighlighting: true, // default is false

      // Omits stack frames from external dependencies like qunit,
      // jasmine or chai, which appear in stack traces of failed
      // tests and which are usually irrelevant to the tested code.
      omitExternalStackFrames: true, // default is false

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

Notes
-----

**For [Grunt] users:** if you use this reporter with the [grunt-karma] task executed via the [grunt-subgrunt] task, do not run `grunt-karma` tasks in parallel. Progress of multiple tests will be written together and appear as a garbage more than usual, because the brief progress is rewritten on a single line using a special cursor movement character. Do not let `grunt-subgrunt` scale on the available CPU count:

```js
  subgrunt: {
    options: {
      // Do not run subtasks concurrently on multiple CPUs.
      limit: 1
    }
  }
```

Contributing
------------

In lieu of a formal styleguide, take care to maintain the existing coding style.  Add unit tests for any new or changed functionality. Lint and test your code using the npm script commands.

License
-------

Copyright (c) 2018-2022 Ferdinand Prantl

Licensed under the MIT license.

[Nyan Cat reporter]: https://github.com/prantlf/karma-nyan-reporter
[Mocha reporter]: https://github.com/litixsoft/karma-mocha-reporter
[Grunt]: https://gruntjs.com/
[grunt-karma]: https://github.com/karma-runner/grunt-karma
[grunt-subgrunt]: https://github.com/tusbar/grunt-subgrunt
