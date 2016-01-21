'use strict';
module.exports = function(grunt, WebDriver, Promise, AxeBuilder, reporter) {
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
	var junitDest = this.data.junitDest;
	Promise.all(this.data.urls.map(function(url) {
		return new Promise(function(resolve, reject) {
			driver
				.get(url)
				.then(function() {
					var startTimestamp = new Date().getTime();
					new AxeBuilder(driver)
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
			var builder = require('junit-report-builder');

			results.forEach(function(result) {
				var suite = builder.testSuite()
					.name(result.url)
					.timestamp(result.timestamp)
					.time(result.time);
				result.violations.forEach(function(ruleResult) {
					ruleResult.nodes.forEach(function(violation) {
						var failure = ruleResult.help + ' (' + ruleResult.helpUrl + ')\n';
						var stacktrace = '';

						if (violation.any.length) {
							stacktrace += 'Fix any of the following:\n';
							violation.any.forEach(function(check) {
								stacktrace += '\u2022 ' + check.message + '\n';
							});
						}

						var alls = violation.all.concat(violation.none);
						if (alls.length) {
							stacktrace += 'Fix all of the following:\n';
							alls.forEach(function(check) {
								stacktrace += '\u2022 ' + check.message + '\n';
							});
						}

						var packageName = result.url;

						suite.testCase()
							.className(packageName + '.' + ruleResult.id)
							.name(violation.target)
							.failure(failure)
							.stacktrace(stacktrace);
					});
				});
				result.passes.forEach(function(ruleResult) {
					ruleResult.nodes.forEach(function(pass) {
						suite.testCase()
							.className(ruleResult.id)
							.name(pass.target);
					});
				});
			});

			builder.writeTo(junitDest);
		}
		var result = reporter(grunt, results, options.threshold);
		driver.quit().then(function() {
			done(result);
		});
	});
};
