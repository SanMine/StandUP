const request = require('supertest');
const app = require('../src/app');

describe('Debug Routes', () => {
  it('should list registered routes', () => {
    const routes = [];
    
    function extractRoutes(stack, prefix = '') {
      stack.forEach(middleware => {
        if (middleware.route) {
          const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
          routes.push(`${methods} ${prefix}${middleware.route.path}`);
        } else if (middleware.name === 'router' && middleware.handle.stack) {
          const path = middleware.regexp.source
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/');
          extractRoutes(middleware.handle.stack, path);
        }
      });
    }
    
    extractRoutes(app._router.stack);
    
    console.log('\n📋 Registered Routes:');
    routes.forEach(route => console.log(`  ${route}`));
    
    // Check if onboarding route exists
    const hasOnboarding = routes.some(route => route.includes('/onboarding'));
    console.log(`\n✓ Onboarding route exists: ${hasOnboarding}`);
    
    expect(routes.length).toBeGreaterThan(0);
  });
});
