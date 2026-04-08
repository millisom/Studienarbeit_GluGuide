import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Setup global React for tests
window.React = React;

// Jest compatibility
window.jest = vi;

// Mock CSS imports
vi.mock('*.css', () => ({}));
vi.mock('*.module.css', () => ({
  default: new Proxy({}, {
    get: (target, prop) => prop
  })
}));

// Fix for matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// KORREKTUR: window.location sicher mocken
const mockLocation = new URL('http://localhost:3000');
mockLocation.reload = vi.fn();
mockLocation.assign = vi.fn();
mockLocation.replace = vi.fn();

delete window.location;
window.location = mockLocation;

// Falls du i18next global hier brauchst (optional, da es schon in tests/setup.jsx ist):
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  }),
  Trans: ({ children }) => children
}));