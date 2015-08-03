'use strict';
module.exports = function (grunt, WebDriver, Promise, AxeBuilder, reporter) {
	var options = this.options({
		browser: 'firefox',
		server: null,
		threshold: 0
	});

	var done = this.async();
	var driver = new WebDriver.Builder()
		.forBrowser(options.browser)
		.build();

	var dest = this.data.dest;
	Promise.all(this.data.urls.map(function(url) {
		return new Promise(function(resolve, reject) {
			driver
				.get(url)
				.then(function() {
					new AxeBuilder(driver)
						.analyze(function (results) {
							results.url = url;
							resolve(results);
						});
				});
		});
	})).then(function(results) {
		if (dest) {
			grunt.file.write(dest, JSON.stringify(results, null, '  '));
		}
		var result = reporter(grunt, results, options.threshold);
		driver.quit().then(function () {
			done(result);
		});
	});
}