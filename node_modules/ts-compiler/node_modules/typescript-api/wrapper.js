var fs = require('fs');
var path = require('path');


var tsFolder = path.dirname(require.resolve('typescript'));
var tscUnlockedPath = path.join(tsFolder, 'tsc-unlocked.js');

try {
	module.exports = require(tscUnlockedPath);
} catch (err) {
	unlockTsc();
	module.exports = require(tscUnlockedPath);
}

function unlockTsc() {
	var tscPath = path.join(tsFolder, 'tsc.js');
	var source = String(fs.readFileSync(tscPath, 'utf8'));
	var lines = source.split(/[\r\n]+/);

	// Remove the following 2 lines from the source code:
	// var batch = new TypeScript.BatchCompiler(TypeScript.IO);
	// batch.batchCompile();
	lines.splice(lines.length - 4, 2);

	// Export the TypeScript module
	lines.push('module.exports = TypeScript;');
	fs.writeFileSync(tscUnlockedPath, lines.join('\n'));
}
