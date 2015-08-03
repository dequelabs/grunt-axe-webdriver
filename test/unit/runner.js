var runner = require('../../lib/runner.js');
var sinon = require('sinon');
var Promise = require('promise');

describe('runner', function () {
	var WebDriver = {};
		WebDriver.Builder = function () {
			return;
		},
		AxeBuilder = function () {
		};

	WebDriver.Builder.prototype.quit = function () {
		return this;
	};
	WebDriver.Builder.prototype.forBrowser = function () {
		return this;
	};
	WebDriver.Builder.prototype.build = function () {
		return this;
	};
	WebDriver.Builder.prototype.get = function () {
		return this;
	};
	WebDriver.Builder.prototype.then = function (cb) {
		cb();
		return this;
	};
	AxeBuilder.prototype.analyze = function (cb) {
		cb({});
	};

	beforeEach(function() {
	  this.sinon = sinon.sandbox.create();
	});
	afterEach(function(){
	  this.sinon.restore();
	});
	it('Should call the options command with the default options', function (done) {
		var last, optsCalled, asyncCalled,
		that = {
			options: function (opts) {
				optsCalled = true;
				return opts;
			},
			async: function () {
				asyncCalled = true;
				return last
			},
			data : {
				dest: undefined,
				urls: ['one url']
			}
		},
		grunt = {},
		reporter = sinon.stub();

		last = function () {
			optsCalled.should.be.true();
			asyncCalled.should.be.true();
			var repCall = reporter.getCall(0);
			repCall.args[1][0]['url'].should.equal('one url');
			done();
		}
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should call grunt.file.write if dest is given', function (done) {
		var last,
		that = {
			options: function (opts) {
				return opts;
			},
			async: function () {
				return last
			},
			data : {
				dest: 'something',
				urls: ['one url']
			}
		},
		grunt = {
			file : {
				write: sinon.stub()
			}
		},
		reporter = function () {};

		last = function () {
			grunt.file.write.called.should.be.true();
			done();
		}
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass options.threshold to the reporter', function (done) {
		var last,
		that = {
			options: function (opts) {
				return {
					browser: 'firefox',
					server: null,
					threshold: 2
				};
			},
			async: function () {
				return last
			},
			data : {
				dest: undefined,
				urls: ['one url']
			}
		},
		grunt = {},
		reporter = sinon.stub();

		last = function () {
			var repCall = reporter.getCall(0);
			repCall.args[2].should.equal(2);
			done();
		}
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass options.browser to WebDriver.forBrowser', function (done) {
		var last, browser,
		that = {
			options: function (opts) {
				return {
					browser: 'goofy',
					server: null,
					threshold: 0
				};
			},
			async: function () {
				return last
			},
			data : {
				dest: undefined,
				urls: ['one url']
			}
		},
		grunt = {},
		reporter = function () {},
		original = WebDriver.Builder.prototype.forBrowser;

		WebDriver.Builder.prototype.forBrowser = function (bws) {
			browser = bws;
			return this;
		};
		last = function () {
			browser.should.equal('goofy');
			WebDriver.Builder.prototype.forBrowser = original;
			done();
		}
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should call done with the result of the reporter', function (done) {
		var last,
		that = {
			options: function (opts) {
				return opts;
			},
			async: function () {
				return last
			},
			data : {
				dest: undefined,
				urls: ['one url']
			}
		},
		grunt = {},
		reporter = function () {
			return { one: 'my goofy result' };
		}

		last = function (result) {
			result.one.should.equal('my goofy result');
			done();
		}
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass the analysis results to the reporter', function (done) {
		var last, results,
		that = {
			options: function (opts) {
				return {
					browser: 'goofy',
					server: null,
					threshold: 0
				};
			},
			async: function () {
				return last
			},
			data : {
				dest: undefined,
				urls: ['one url', 'two url']
			}
		},
		grunt = {},
		reporter = function (g, res) {
			results = res;
		},
		original = AxeBuilder.prototype.analyze;
		AxeBuilder.prototype.analyze = function (cb) {
			cb({ something: 'that I analyzed' });
		}
		last = function () {
			results.length.should.equal(2); // two urls
			results[0].something.should.equal('that I analyzed');
			AxeBuilder.prototype.analyze = original;
			done();
		}
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
});