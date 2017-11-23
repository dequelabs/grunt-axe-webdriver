'use strict';

var junitReporter = require('./junitReporter');
var chrome = require('selenium-webdriver/chrome');
var firefox = require('selenium-webdriver/firefox');
require('chromedriver');

module.exports = function(grunt, WebDriver, Promise, AxeBuilder, reporter) {
	var options = this.options({
		browser: 'firefox',
		browserArguments: '',
		server: null,
		threshold: 0,
		tags: null
	});

	var tagsAreDefined =
		(!Array.isArray(options.tags) && options.tags !== null && options.tags !== '') ||
		(Array.isArray(options.tags) && options.tags.length > 0);
	var done = this.async();
	var driver = new WebDriver.Builder()
		.forBrowser(options.browser)
		.setChromeOptions(new chrome.Options().addArguments(options.browserArguments))
		.setFirefoxOptions(new firefox.Options().addArguments(options.browserArguments))
		.usingServer(options.server)
		.build();

	var dest = this.data.dest;
	var junitDest = this.data.junitDest;

	if(typeof this.data.urls === 'function') {
		this.data.urls = this.data.urls();
	}

	Promise.all(this.data.urls.map(function(url) {
		return new Promise(function(resolve, reject) {
			driver
				.get(url)
				.then(function() {
					var startTimestamp = new Date().getTime();
					var axeBuilder = new AxeBuilder(driver);

					if (tagsAreDefined) {
						axeBuilder.withTags(options.tags);
					}

					axeBuilder
						.analyze(function(results) {
							results.url = url;
							// The "new Date()" timestamp in axe-core is, here, an empty object...
							results.timestamp = new Date().getTime();
							results.time = results.timestamp - startTimestamp;
							resolve(results);
						});
				});
		});
	})).then(function(results) {
		if (dest) {
			grunt.file.write(dest, JSON.stringify(results, null, '  '));
		}
		if (junitDest) {
			junitReporter(results, junitDest);
		}
		var result = reporter(grunt, results, options.threshold);
		driver.quit().then(function() {
			done(result);
		});
	});
};
