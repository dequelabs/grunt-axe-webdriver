var task = require('../../tasks/axe-webdriver.js');
var sinon = require('sinon');

describe('axe-webdriver grunt task', function () {
	beforeEach(function() {
	  this.sinon = sinon.sandbox.create();
	});
	afterEach(function(){
	  this.sinon.restore();
	});
	it('should register an axe-webdriver task with callback function', function () {
		var grunt = {
			registerMultiTask: sinon.stub()
		};
		task(grunt);
		grunt.registerMultiTask.called.should.be.true();
		var call = grunt.registerMultiTask.getCall(0);
		call.args[0].should.equal('axe-webdriver');
		(typeof call.args[2]).should.equal('function');
	});
});
