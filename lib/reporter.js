

function color(code, str) {
	return '\u001b[' + code + 'm' + str + '\u001b[0m';
}

module.exports = function (grunt, results, threshold) {
	var pass = true;
	results.forEach(function (result) {
		grunt.log.subhead(result.url);
		var violations = result.violations;
		if (violations.length) {
			if (violations.length > threshold) {
				pass = false;
				grunt.log.error('Found ' + result.violations.length + ' accessibility violations:');
			} else {
				grunt.log.ok('Found ' + result.violations.length + ' accessibility violations: (under threshold of ' + threshold + ')');
			}
			result.violations.forEach(function (ruleResult) {
				grunt.log.subhead(' ' + color(31, '\u00D7') + ' ' + ruleResult.help);

				ruleResult.nodes.forEach(function (violation, index) {
					grunt.log.writeln('   ' + (index + 1) + '. ' + JSON.stringify(violation.target));

					if (violation.any.length) {
						grunt.log.writeln('       Fix any of the following:');
						violation.any.forEach(function (check) {
							grunt.log.writeln('        \u2022 ' + check.message);
						});
					}

					var alls = violation.all.concat(violation.none);
					if (alls.length) {
						grunt.log.writeln('       Fix all of the following:');
						alls.forEach(function (check) {
							grunt.log.writeln('        \u2022 ' + check.message);
						});
					}
					grunt.log.writeln();

				});
			});
			return;
		} else {
			grunt.log.ok('Found no accessibility violations.');
		}
	});

	return pass;
};
