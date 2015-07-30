/*! aXe-grunt-webdriver
 * Copyright (c) 2015 Deque Systems, Inc.
 *
 * Your use of this Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This entire copyright notice must appear in every copy of this file you
 * distribute or in any file that contains substantial portions of this source
 * code.
 */

'use strict';

module.exports = function(grunt) {
	var WebDriver = require('selenium-webdriver'),
		AxeBuilder = require('axe-webdriverjs'),
		Promise = require('promise'),
		path = require('path'),
		reporter = require('../lib/reporter');

	grunt.registerMultiTask('axe-webdriver', 'Grunt plugin for aXe utilizing WebDriverJS', function() {
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
	});
};
