'use strict';

var junitReporter = require('./junitReporter');

module.exports = function(grunt, WebDriver, Promise, AxeBuilder, reporter) {
	var options = this.options({
		browser: 'firefox',
		server: null,
		threshold: 0,
		tags: null
	});

	var done = this.async();
	var driver = new WebDriver.Builder()
		.forBrowser(options.browser)
		.build();

	var dest = this.data.dest;
	var junitDest = this.data.junitDest;
	Promise.all(this.data.urls.map(function(url) {
		return new Promise(function(resolve, reject) {
			driver
				.get(url)
				.then(function() {
					var startTimestamp = new Date().getTime();
					new AxeBuilder(driver)
						.withTags(options.tags)
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
