function mockYargs(argv) {
	const yargs = new Proxy(
		{},
		{
			get(obj, prop) {
				if (prop === "epilog") {
					return () => ({ argv });
				} else {
					return () => yargs;
				}
			},
		}
	);
	return () => yargs;
}

module.exports = {
	mockYargs,
};
