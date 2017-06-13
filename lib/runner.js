'use strict';

require('chromedriver');

var junitReporter = require('./junitReporter');
var webdriver = require('selenium-webdriver');
const path = require('path');
var fs = require('fs');

module.exports = function (grunt, WebDriver, Promise, AxeBuilder, reporter) {
	var options = this.options({
		browser: 'firefox',
		server: null,
		threshold: 0,
		tags: null
	});

	var self = this;

	var tagsAreDefined =
		(!Array.isArray(options.tags) && options.tags !== null && options.tags !== '') ||
		(Array.isArray(options.tags) && options.tags.length > 0);
	var done = this.async();
	var driver = new WebDriver.Builder()
		.forBrowser(options.browser)
		.usingServer(options.server)
		.build();

	var dest = this.data.dest;
	var junitDest = this.data.junitDest;

	if (typeof this.data.urls === 'function') {
		this.data.urls = this.data.urls();
	}

	if (this.data.loginurl) {
		console.log('Executing login script');
		console.log("URL: " + this.data.loginurl);
		console.log(this.data.userControlName + ':' + this.data.user);
		console.log(this.data.passControlName + ':' + this.data.pass);
		console.log(this.data.loginButtonName);

		driver.get(this.data.loginurl)
			.then(function () {

				driver.findElement(webdriver.By.xpath(this.data.userControlName)).sendKeys(this.data.user);
				driver.findElement(webdriver.By.xpath(this.data.passControlName)).sendKeys(this.data.pass);
				driver.findElement(webdriver.By.xpath(this.data.loginButtonName)).click();
				console.log('Waiting for ' + this.data.titleToWait);
				driver.wait(webdriver.until.titleContains(this.data.titleToWait), 1000, "Deu ruim");

			});
	}

	console.log("Initiating web accessibility test...");

	Promise.all(this.data.urls.map(function (urlAndScript) {
		return new Promise(function (resolve, reject) {

			var url = urlAndScript.split(';')[0];
			var preScriptPath = urlAndScript.split(';')[1];

			driver
				.get(url)
				.then(function () {
					if (preScriptPath) {
						var absoluteFilePath = path.resolve(preScriptPath);
						var scriptString = fs.readFileSync(absoluteFilePath, "utf-8");

						driver.executeScript(scriptString);
					}

					var startTimestamp = new Date().getTime();

					var axeBuilder = new AxeBuilder(driver);

					if (tagsAreDefined) {
						axeBuilder.withTags(options.tags);
					}

					axeBuilder
						.analyze(function (results) {
							results.url = url;
							// The "new Date()" timestamp in axe-core is, here, an empty object...
							results.timestamp = new Date().getTime();
							results.time = results.timestamp - startTimestamp;
							resolve(results);
						});
				});
		});
	})).then(function (results) {
		if (dest) {
			grunt.file.write(dest, JSON.stringify(results, null, '  '));
		}
		if (junitDest) {
			junitReporter(results, junitDest);
		}
		var result = reporter(grunt, results, options.threshold);
		driver.quit().then(function () {
			done(result);
		});
	});
};
