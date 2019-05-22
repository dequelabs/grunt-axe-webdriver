module.exports = grunt => {
	grunt.loadTasks('../tasks');
	grunt.initConfig({
		'axe-webdriver': {
			chrome: {
				options: {
					browser: 'chrome'
				},
				urls: ['http://example.com']
			}
		}
	});
	grunt.registerTask('default', ['axe-webdriver']);
};
