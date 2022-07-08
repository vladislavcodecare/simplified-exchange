exports.col = {
	black: (...args) => `\x1b[40m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
	red: (...args) => `\x1b[41m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
	green: (...args) => `\x1b[42m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
	yellow: (...args) => `\x1b[43m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
	blue: (...args) => `\x1b[44m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
	magenta: (...args) => `\x1b[45m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
	cyan: (...args) => `\x1b[46m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
	white: (...args) => `\x1b[47m${`\x1b[30m${args.join(' ')}`}\x1b[0m`,
};
