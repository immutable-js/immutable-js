var sprintf = require(__dirname + '/..');

exports['sprintf() export works'] = function(test) {
	test.equal(sprintf('Hallo %s!', 'Welt'), 'Hallo Welt!');
	test.equal(sprintf.sprintf('Hallo %s!', 'Welt'), 'Hallo Welt!');
	test.equal(sprintf.vsprintf('Hallo %s!', ['Welt']), 'Hallo Welt!');

	test.done();
};
