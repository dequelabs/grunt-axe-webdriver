var reporter = require('../../lib/reporter.js');
var sinon = require('sinon');
var grunt = require('grunt');

describe('reporter', function () {
	var results;

	sinon.stub(grunt.log);

	beforeEach(function () {
		results = [
			{
				url: 'http://test.com',
				violations: [
					{
						nodes: []
					}
				]
			}
		]
	});

	it('1 violation should return a false status if threshold is 0', function () {
		reporter(grunt, results, 0).should.be.false();
	});
	it('1 violation should return a true status if threshold is 1 or greater', function () {
		for (var i = 1; i <= 10; i++) {
			reporter(grunt, results, i).should.be.true();
		}
	});
	it('whatever the number of violation, we should always return a true status if threshold is negative', function () {
		for (var i = 0; i < 1000; i++) {
			results[0].violations.push({nodes: []});
		}
		reporter(grunt, results, -1).should.be.true();
		reporter(grunt, results, -2).should.be.true();
	});

});
