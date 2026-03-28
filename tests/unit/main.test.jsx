/**
 * Bootstrap entry: ensures App is mounted under StrictMode.
 */
import React from 'react';

const mockRender = jest.fn();

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn((container) => ({
    render: (node) => mockRender(node, container),
  })),
}));

jest.mock('../../src/App.jsx', () => ({
  __esModule: true,
  default: function MockApp() {
    return <div data-testid="mock-app">MockApp</div>;
  },
}));

describe('main.jsx', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    jest.resetModules();
    mockRender.mockClear();
    const { createRoot } = require('react-dom/client');
    createRoot.mockClear();
  });

  it('creates root on #root and renders App inside StrictMode', () => {
    let AppComponent;
    jest.isolateModules(() => {
      AppComponent = require('../../src/App.jsx').default;
      require('../../src/main.jsx');
    });

    const { createRoot } = require('react-dom/client');
    const rootEl = document.getElementById('root');

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(rootEl);
    expect(mockRender).toHaveBeenCalledTimes(1);

    const strictEl = mockRender.mock.calls[0][0];
    expect(strictEl.type).toBe(React.StrictMode);
    expect(strictEl.props.children.type).toBe(AppComponent);
  });
});
