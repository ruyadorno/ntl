const path = require("path");

const spawn = require("cross-spawn");

function readLastLine(res) {
	return res[res.length - 1].toString().trim();
}

function run({ alias, cwd, env } = {}, args = []) {
	args = [path.resolve(__dirname, "../..", alias || "cli.js"), ...args];
	const cp = spawn(process.execPath, args, {
		cwd,
		env: Object.assign({}, process.env, env),
	});
	const { stderr, stdin, stdout } = cp;

	function assertExitCode(t, expectedCode, assertMsg) {
		cp.on("close", function (code) {
			t.equal(code, expectedCode, assertMsg);
		});
	}

	function assertNotStderrData(t) {
		stderr.on("data", (data) => {
			console.error(data.toString());
			t.fail("should not have stderr output");
		});
	}

	function getStreamResult(stream) {
		return new Promise((res, rej) => {
			let result = [];
			stream.on("error", rej);
			stream.on("data", (data) => {
				result.push(data.toString());
			});
			stream.on("end", () => res(result));
		});
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
		stdout,
	};
}

module.exports = {
	readLastLine,
	run,
};
