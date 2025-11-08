// Tiny harmless example to demonstrate exports.

/**
 * Return a greeting for the provided name.
 * This is purely illustrative and not used by other code.
 */
function greet(name) {
	if (!name) return 'Hello';
	return `Hello, ${name}`;
}

module.exports = { greet };
