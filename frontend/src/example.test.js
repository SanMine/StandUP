const { sayHello, multiply, isEven } = require('./example');

test('sayHello returns default greeting when name missing', () => {
  expect(sayHello()).toBe('Hello');
});

test('sayHello returns personalized greeting', () => {
  expect(sayHello('Sam')).toBe('Hello, Sam');
});

test('multiply multiplies numbers', () => {
  expect(multiply(4, 5)).toBe(20);
});

test('isEven correctly identifies even and odd', () => {
  expect(isEven(2)).toBe(true);
  expect(isEven(3)).toBe(false);
  expect(isEven('4')).toBe(false);
});
