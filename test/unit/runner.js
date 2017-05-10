var runner = require('../../lib/runner.js');
var sinon = require('sinon');
var Promise = require('promise');

describe('runner', function () {
	var WebDriver = {};
	WebDriver.Builder = function () {
	};
	var AxeBuilder = function () {
	};

	WebDriver.Builder.prototype.quit = function () {
		return this;
	};
	WebDriver.Builder.prototype.forBrowser = function () {
		return this;
	};
	WebDriver.Builder.prototype.usingServer = function () {
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
	AxeBuilder.prototype.withTags = function (tags) {
		return this;
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
		};
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
		};
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass options.threshold to the reporter', function (done) {
		var last,
		that = {
			options: function () {
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
		};
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass options.browser to WebDriver.forBrowser', function (done) {
		var last, browser,
		that = {
			options: function () {
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
		};
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
		};

		last = function (result) {
			result.one.should.equal('my goofy result');
			done();
		};
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass the analysis results to the reporter', function (done) {
		var last, results,
		that = {
			options: function () {
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
		};
		last = function () {
			results.length.should.equal(2); // two urls
			results[0].something.should.equal('that I analyzed');
			AxeBuilder.prototype.analyze = original;
			done();
		};
		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass single options.tags as a string to AxeBuilder.withTags', function (done) {
		var last, tags,
			that = {
				options: function () {
					return {
						tags: 'TagToCheck'
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
			original = AxeBuilder.prototype.withTags;

		AxeBuilder.prototype.withTags = function (_tags) {
			tags = _tags;
			return this;
		};

		last = function () {
			tags.should.equal('TagToCheck');
			AxeBuilder.prototype.withTags = original;
			done();
		};

		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should pass multiple options.tags as an array of strings to AxeBuilder.withTags', function (done) {
		var last, tags,
			that = {
				options: function () {
					return {
						tags: ['FirstTagToCheck', 'SecondTagToCheck']
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
			original = AxeBuilder.prototype.withTags;

		AxeBuilder.prototype.withTags = function (_tags) {
			tags = _tags;
			return this;
		};

		last = function () {
			tags[0].should.equal('FirstTagToCheck');
			tags[1].should.equal('SecondTagToCheck');
			AxeBuilder.prototype.withTags = original;
			done();
		};

		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	});
	it('Should not call AxeBuilder.withTags when options.tags is an empty string', function (done) {
		CheckWithTagsIsNotCalled(done, '');
	});
	it('Should not call AxeBuilder.withTags when options.tags is null', function (done) {
		CheckWithTagsIsNotCalled(done, null);
	});
	it('Should not call AxeBuilder.withTags when options.tags is an empty array', function (done) {
		CheckWithTagsIsNotCalled(done, []);
	});
	
	function CheckWithTagsIsNotCalled(done, tags) {
		var last,
			that = {
				options: function () {
					return {
						tags: tags
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
			original = AxeBuilder.prototype.withTags;

		AxeBuilder.prototype.withTags = sinon.stub();

		last = function () {
			AxeBuilder.prototype.withTags.called.should.be.false();
			AxeBuilder.prototype.withTags = original;
			done();
		};

		runner.call(that, grunt, WebDriver, Promise, AxeBuilder, reporter);
	}
});
