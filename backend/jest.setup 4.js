require('dotenv').config();

process.env.NODE_ENV = 'test';

jest.setTimeout(30000);

console.log('Test environment loaded');
console.log('PayPal API:', process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com');