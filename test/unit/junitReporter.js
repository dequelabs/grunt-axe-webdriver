var junitReportBuilder = require('junit-report-builder');
var junitReporter = require('../../lib/junitReporter.js');
var sinon = require('sinon');
var parseString = require('xml2js').parseString;

describe('junitReporter', function () {
	beforeEach(function () {
		this.sinon = sinon.sandbox.create();
	});
	afterEach(function () {
		this.sinon.restore();
	});
	it('Should generate a Junit XML file from a JSON report', function () {
		var results = [
			{
				url: 'http://test.com',
				timestamp: new Date().getTime(),
				time: 42,
				violations: [
					{
						id: 'ruleId1',
						help: 'Help message',
						helpUrl: 'helpURL',
						nodes: [
							{
								target: 'div > div',
								html: '<a href="#">My HTML element</a>',
								any: [
									{
										message: 'First message'
									},
									{
										message: 'Second message',
										relatedNodes: [
											{
												target: [
													'body > .related > .node'
												]
											}
										]
									}
								],
								all: [],
								none: []
							}
						]
					}
				],
				passes: [
					{
						id: 'ruleId2',
						nodes: [
							{
								target: 'div > span > a'
							}
						]
					}
				]
			}
		];
		var junitDest = 'junitDest.xml';

		var junitXml = null;
		var writeToSpy = sinon.stub(junitReportBuilder, 'writeTo', function () {
			junitXml = junitReportBuilder.build();
		});

		junitReporter(results, junitDest);

		sinon.assert.calledOnce(writeToSpy);
		sinon.assert.calledWith(writeToSpy, junitDest);

		parseString(junitXml, function (err, result) {
			result.should.have.keys('testsuites');
			result.testsuites.should.have.keys('testsuite');

			var testsuite = result.testsuites.testsuite[0];
			testsuite.$.name.should.equal(results[0].url);
			testsuite.$.timestamp.should.equal('' + results[0].timestamp);
			testsuite.$.time.should.equal('' + results[0].time);
			testsuite.$.tests.should.equal('' + (results[0].violations.length + results[0].passes.length));
			testsuite.$.failures.should.equal('' + results[0].violations.length);

			var testcase1 = testsuite.testcase[0];
			testcase1.$.classname.should.equal(results[0].url + '.' + results[0].violations[0].id);
			testcase1.$.name.should.equal(results[0].violations[0].nodes[0].target);

			var failure = testcase1.failure[0];
			failure.$.message.should.match(new RegExp(results[0].violations[0].help));
			failure.$.message.should.match(new RegExp(results[0].violations[0].helpUrl));
			failure._.should.match(new RegExp(results[0].violations[0].nodes[0].html));
			failure._.should.match(new RegExp(results[0].violations[0].nodes[0].any[0].message));
			failure._.should.match(new RegExp(results[0].violations[0].nodes[0].any[1].message));
			failure._.should.match(new RegExp(results[0].violations[0].nodes[0].any[1].relatedNodes[0].target));

			var testcase2 = testsuite.testcase[1];
			testcase2.$.classname.should.equal(results[0].url + '.' + results[0].passes[0].id);
			testcase2.$.name.should.equal(results[0].passes[0].nodes[0].target);
		});
	});
});
