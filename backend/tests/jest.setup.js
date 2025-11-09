// Jest setup file to polyfill fetch and related globals in Node test environment
const crossFetch = require('cross-fetch');
global.fetch = crossFetch;
// polyfill Headers/Request/Response which some libs expect
if (typeof global.Headers === 'undefined') global.Headers = crossFetch.Headers;
if (typeof global.Request === 'undefined') global.Request = crossFetch.Request;
if (typeof global.Response === 'undefined') global.Response = crossFetch.Response;
