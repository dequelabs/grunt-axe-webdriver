var fs = require('fs');

const head = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	<title>HTML Report of grunt-axe-webdriver</title>
	<style>
		.ok {
			color: green;
		}
		.error {
			/* with just red it does not pass the axe test because contrast is too low ;) */
			color: darkred;
		}
		section {
			margin-bottom: 2em;
		}
	</style>
  </head>
`;

module.exports = function(results, htmlDest) {
	let html = head;
	html += '<body>';
	html += '<main>';
	html += '<h1>HTML Report of grunt-axe-webdriver</h1>';
	results.forEach(function(result) {
		html += '<section>';
		html += `<h2><a href="${result.url}">${result.url}</a></h2>`
		var violations = result.violations;
		if (violations.length) {
			html += `<h3 class="error">Found ${violations.length} accessibility violations:</h3>`
			violations.forEach(function(ruleResult) {
				html += `<h4><span class="error">×</span> ${ruleResult.help}</h4>`;
				html += '<ol>';

				ruleResult.nodes.forEach(function(violation, index) {
					const target = JSON.stringify(violation.target);
					html += '<li>';
					html += `${target}<br>`;

					if (violation.any.length) {
						html += 'Fix any of the following:<br>';
						html += '<ul>';
						violation.any.forEach(function(check) {
							html += `<li>${check.message}</li>`;
						});
						html += '</ul>';
					}

					var alls = violation.all.concat(violation.none);
					if (alls.length) {
						html += 'Fix all of the following:<br>';
						html += '<ul>';
						alls.forEach(function(check) {
							html += `<li>${check.message}</li>`;
						});
						html += '</ul>';
					}
					html += '</li>';
				});
				html += '</ol>';
			});
		} else {
			html += '<h3 class="ok">Found no accessibility violations.</h3>';
			html += `<p>
						Please note that only 20&nbsp;% to 50&nbsp;% of all accessibility issues can be automatically detected.
						Manual testing is always required. For more information see:<br>
						<a target="_blank" href="https://dequeuniversity.com/curriculum/courses/testingmethods">https://dequeuniversity.com/curriculum/courses/testingmethods</a>
					</p>`
		}
		html += '</section>';
	});
	html += '</main>';
	html += '</body>';
	html += '</html>';

	fs.writeFile(htmlDest, html, function(err) {
		if (err) {
			return console.log(err);
		}
	});

};
