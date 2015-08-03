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
	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-mocha-cli');

	grunt.initConfig({
		connect: {
			test: {
				options: {
					hostname: '0.0.0.0',
					port: grunt.option('port') || 9876,
					base: ['.']
				}
			}
		},
		"axe-webdriver" : {
			firefox: {
				options: {
					threshold: 2
				},
				urls: ['http://localhost:' + (grunt.option('port') || 9876) + '/test/fixtures/document-language.html']
			},
			chrome: {
				options: {
					browser: 'chrome'
				},
				urls: ['http://localhost:' + (grunt.option('port') || 9876) + '/test/fixtures/document-language.html'],
				dest: 'tmp/gu.json'
			}
		},
		mochacli: {
			options: {
				require: ['should'],
				reporter: 'nyan',
				bail: true
			},
			all: ['test/unit/*.js']
		}
	});

	grunt.registerTask('example', ['connect', 'axe-webdriver']);
	grunt.registerTask('test', ['mochacli']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['test', 'example']);

};
