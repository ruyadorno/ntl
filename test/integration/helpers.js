const path = require("path");

const spawn = require("cross-spawn");
const Minipass = require("minipass");

function readLastLine(res) {
	return res[res.length - 1].toString().trim();
}

function run({ alias, cwd, env } = {}, args = []) {
	const cmd = path.join(path.resolve(__dirname, "../.."), alias || "cli.js");
	const cp = spawn(cmd, args, {
		cwd,
		env: Object.assign({}, process.env, env)
	});
	const { stderr, stdin, stdout } = cp;

	function assertExitCode(t, expectedCode, assertMsg) {
		cp.on("close", function(code) {
			t.equal(code, expectedCode, assertMsg);
		});
	}

	function assertNotStderrData(t) {
		stderr.on("data", data => {
			console.error(data.toString());
			t.fail("should not have stderr output");
		});
	}

	function getStreamResult(stream) {
		const ministream = new Minipass();
		stream.pipe(ministream);
		return ministream.collect();
	}

	function getStderrResult() {
		return getStreamResult(stderr);
	}

	function getStdoutResult() {
		return getStreamResult(stdout);
	}

	return {
		assertExitCode,
		assertNotStderrData,
		getStderrResult,
		getStdoutResult,
		stderr,
		stdin,
		stdout
	};
}

module.exports = {
	readLastLine,
	run
};
