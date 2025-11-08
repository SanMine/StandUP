// Small example utilities for demonstration and tests.

/**
 * Return a friendly greeting.
 * @param {string} name
 */
function sayHello(name) {
  if (typeof name !== 'string' || name.length === 0) return 'Hello';
  return `Hello, ${name}`;
}

/**
 * Multiply two numbers (simple deterministic behavior).
 */
function multiply(a, b) {
  return a * b;
}

/**
 * Returns true when n is an even integer.
 */
function isEven(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return false;
  return n % 2 === 0;
}

module.exports = { sayHello, multiply, isEven };
