const React = require('react');

module.exports = {
  MemoryRouter: ({ children }) => React.createElement('div', null, children),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
};
