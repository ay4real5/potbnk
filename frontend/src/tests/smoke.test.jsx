/**
 * Smoke tests — verify key components render without crashing.
 *
 * Strategy:
 *  - Mock AuthContext so Navbar doesn't call the API
 *  - Mock the API client so no real HTTP requests are made
 *  - Wrap everything in MemoryRouter to satisfy react-router-dom hooks
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock AuthContext ───────────────────────────────────────────────────────────
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, token: null, login: vi.fn(), logout: vi.fn() }),
  AuthProvider: ({ children }) => children,
}));

// ── Mock API client ───────────────────────────────────────────────────────────
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    patch: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function Wrapper({ children, initialEntry = '/' }) {
  return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
}

// ── ErrorBoundary ─────────────────────────────────────────────────────────────
import ErrorBoundary from '../components/ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeAll(() => {
    // Suppress expected console.error from intentional throw
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    function Bomb() {
      throw new Error('Test explosion');
    }
    render(
      <Wrapper>
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </Wrapper>,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/return to dashboard/i)).toBeInTheDocument();
  });
});

// ── NotFound page ─────────────────────────────────────────────────────────────
import NotFound from '../pages/NotFound';

describe('NotFound', () => {
  it('renders a 404 message', () => {
    render(
      <Wrapper>
        <NotFound />
      </Wrapper>,
    );
    // The page renders a giant "404" text
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});

// ── Footer ────────────────────────────────────────────────────────────────────
import Footer from '../components/Footer';

describe('Footer', () => {
  it('renders navigation columns', () => {
    render(
      <Wrapper>
        <Footer />
      </Wrapper>,
    );
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });
});

// ── ForgotPassword page ───────────────────────────────────────────────────────
import ForgotPassword from '../pages/ForgotPassword';

describe('ForgotPassword', () => {
  it('renders the email input form', () => {
    render(
      <Wrapper>
        <ForgotPassword />
      </Wrapper>,
    );
    expect(screen.getByRole('button', { name: /send reset/i })).toBeInTheDocument();
  });
});
