/**
 * Bootstrap entry: ensures App is mounted under StrictMode.
 */
import React from 'react';

const mockRender = vi.fn();

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn((container) => ({
      render: (node) => mockRender(node, container),
    })),
  },
}));

vi.mock('./App.jsx', () => ({
  __esModule: true,
  default: function MockApp() {
    return <div data-testid="mock-app">MockApp</div>;
  },
}));

vi.mock('framer-motion', () => ({
  LazyMotion: function MockLazyMotion({ children }) {
    return children;
  },
  domAnimation: {},
}));

describe('main.jsx', () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.resetModules();
    mockRender.mockClear();
    const ReactDOM = await import('react-dom/client');
    ReactDOM.default.createRoot.mockClear();
  });

  it('creates root on #root and renders App inside StrictMode', async () => {
    await import('./main.jsx');
    const ReactDOM = await import('react-dom/client');
    const { createRoot } = ReactDOM.default;
    const { default: AppComponent } = await import('./App.jsx');
    const rootEl = document.getElementById('root');

    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(rootEl);
    expect(mockRender).toHaveBeenCalledTimes(1);

    const strictEl = mockRender.mock.calls[0][0];
    expect(strictEl.type).toBe(React.StrictMode);
    expect(strictEl.props.children.type.name).toBe('MockLazyMotion');
    expect(strictEl.props.children.props.children.type).toBe(AppComponent);
  });
});
