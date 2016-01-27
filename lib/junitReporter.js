var junitReportBuilder = require('junit-report-builder');
module.exports = function (results, junitDest) {
	results.forEach(function (result) {
		var suite = junitReportBuilder.testSuite()
			.name(result.url)
			.timestamp(result.timestamp)
			.time(result.time);
		var packageName = result.url;
		result.violations.forEach(function (ruleResult) {
			ruleResult.nodes.forEach(function (violation) {
				var failure = ruleResult.help + ' (' + ruleResult.helpUrl + ')\n';
				var stacktrace = '';

				if (violation.any.length) {
					stacktrace += 'Fix any of the following:\n';
					violation.any.forEach(function (check) {
						stacktrace += '\u2022 ' + check.message + '\n';
					});
				}

				var alls = violation.all.concat(violation.none);
				if (alls.length) {
					stacktrace += 'Fix all of the following:\n';
					alls.forEach(function (check) {
						stacktrace += '\u2022 ' + check.message + '\n';
					});
				}

				suite.testCase()
					.className(packageName + '.' + ruleResult.id)
					.name(violation.target)
					.failure(failure)
					.stacktrace(stacktrace);
			});
		});
		result.passes.forEach(function (ruleResult) {
			ruleResult.nodes.forEach(function (pass) {
				suite.testCase()
					.className(packageName + '.' + ruleResult.id)
					.name(pass.target);
			});
		});
	});

	junitReportBuilder.writeTo(junitDest);
};
