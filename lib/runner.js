'use strict';

var junitReporter = require('./junitReporter');
var webdriver = require('selenium-webdriver');

require('chromedriver');

module.exports = function(grunt, WebDriver, Promise, AxeBuilder, reporter) {
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

	if(typeof this.data.urls === 'function') {
		this.data.urls = this.data.urls();
	}
	
	if(this.data.loginurl != '')
	{    
		console.log('Executing login script');
		console.log("URL: " + this.data.loginurl);
		console.log(this.data.userControlName + ':' + this.data.user );
		console.log(this.data.passControlName + ':' + this.data.pass );
		console.log(this.data.loginButtonName);
		
		driver.get(this.data.loginurl);
		driver.findElement(webdriver.By.xpath(this.data.userControlName)).sendKeys(this.data.user);	
		driver.findElement(webdriver.By.xpath(this.data.passControlName)).sendKeys(this.data.pass);   
		driver.findElement(webdriver.By.xpath(this.data.loginButtonName)).click();  

		console.log('Waiting for ' + this.data.titleToWait);  

		driver.wait(webdriver.until.titleContains(this.data.titleToWait), 1000, "Deu ruim");

		console.log("Iniciando o teste");

		// driver.wait(function() {
        // 	return driver.getTitle().then(function(title) {
		// 		var t = title.toString();
		//   		return t.indexOf(self.data.titleToWait) !== -1;
        // 	});
      	// }, 1000);
	}
	Promise.all(this.data.urls.map(function(url) {
		return new Promise(function(resolve, reject) {
			driver
			
				.get(url)
				.then(function() {
					var startTimestamp = new Date().getTime();
			
					var axeBuilder = new AxeBuilder(driver);
					
					if (tagsAreDefined) {
						axeBuilder.withTags(options.tags);
					}
					
					axeBuilder
						.analyze(function(results) {
							results.url = url;
							// The "new Date()" timestamp in axe-core is, here, an empty object...
							results.timestamp = new Date().getTime();
							results.time = results.timestamp - startTimestamp;
							resolve(results);
						});
				});
		});
	})).then(function(results) {
		if (dest) {
			grunt.file.write(dest, JSON.stringify(results, null, '  '));
		}
		if (junitDest) {
			junitReporter(results, junitDest);
		}
		var result = reporter(grunt, results, options.threshold);
		driver.quit().then(function() {
			done(result);
		});
	});
};
