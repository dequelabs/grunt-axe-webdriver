# grunt-axe-webdriver

[![Package Quality](http://npm.packagequality.com/shield/grunt-axe-webdriver.svg)](http://packagequality.com/#?package=grunt-axe-webdriver)

> Grunt plugin for aXe utilizing WebDriverJS

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-axe-webdriver --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-axe-webdriver');
```

## The "axe-webdriver" task

### Overview
In your project's Gruntfile, add a section named `axe-webdriver` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  "axe-webdriver": {
    your_browser_target: {
      // Target-specific file lists and/or options go here.
      options: {
      }
      urls: [],
      dest: "output.json",
      junitDest: "output.xml"
    },
  },
});
```

### options
Type: `Object`
Default value:
```
{
  browser: 'firefox',
  threshold: 0,
  tags: null
}
```

#### threshold
Type: `Number`
Default value: `0`

A number that represents the maximum number of allowable violations. Each violation represents a rule that fails, it may fail for an number of nodes. It is recommended that this value not be changed.
A negative value will prevent failure whatever the number of violations.

#### browser
Type: `String`
Default value: `firefox`

Which browser to run the tests in

#### tags
Type: `String` or `Array[String]`
Default value: `null`

Which tags to filter violations on

### urls
Type: `Array[String]|callback`
Default value: `[]`

An Array of URLs that will be tested. The default value is an empty array, you must supply at least one URL in order to successfully complete this task.

Can also be a callback function that returns an array of URLs.

### server
Type: `String`
Default value: `null`

Address of the selenium server to run the tests against. Defaults to a direct connection to the local browser.

### dest
Type: `String`
Default value: undefined

An optional file to which the results of the accessibility scans will be written as a JSON Array of results objects.

### junitDest
Type: `String`
Default value: undefined

An optional file to which the results of the accessibility scans will be written as a Junit XML file.

### Usage Examples

#### Default Options
In this example, the default options are used in combination with a list of two URLs that are to be tested for accessibility issues. The accessibility tests wil be run in Firefox only. The results will not be output but will be tested for zero violations. If violations occur, the Grunt task will fail and interrupt the Grunt script.

```js
grunt.initConfig({
  "axe-webdriver": {
    firefox: {
      options: {},
      urls: ['http://localhost:9876/tests/test1.html', 'http://localhost:9876/tests/test2.html']
    }
  },
});
```

#### Additional browser
In this example, the custom target browser option is used to add tests for the Chrome browser. Note that the urls for each target must be supplied. This also means that the urls can be different for each browser.

```js
grunt.initConfig({
  "axe-webdriver": {
    firefox: {
      options: {},
      urls: ['http://localhost:9876/tests/test1.html', 'http://localhost:9876/tests/test2.html']
    },
    chrome: {
      options: {
        browser: "chrome"
      },
      urls: ['http://localhost:9876/tests/test1.html', 'http://localhost:9876/tests/test2.html'],
    }
  },
});
```

#### Tag filtering
##### Single
In this example, the only violations that will be checked for are those that have the matching tag.
```js
grunt.initConfig({
  "axe-webdriver": {
    firefox: {
      options: {
        tags: 'wcag2a'
      },
      urls: ['http://localhost:9876/tests/test1.html', 'http://localhost:9876/tests/test2.html']
    }
  }
});
```

##### Multiple
In this example, the only violations that will be checked for are those that have one of the matching tags.
```js
grunt.initConfig({
  "axe-webdriver": {
    firefox: {
      options: {
        tags: ['wcag2a', 'wcag2aa']
      },
      urls: ['http://localhost:9876/tests/test1.html', 'http://localhost:9876/tests/test2.html']
    }
  }
});
```

## Contributing

Read the [documentation on contributing](CONTRIBUTING.md)

## Release History
_(Nothing yet)_
