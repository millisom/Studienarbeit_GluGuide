import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';


window.React = React;


window.jest = vi;


vi.mock('*.css', () => ({}));
vi.mock('*.module.css', () => ({
  default: new Proxy({}, {
    get: (target, prop) => prop
  })
}));


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


const mockLocation = new URL('http://localhost:3000');
mockLocation.reload = vi.fn();
mockLocation.assign = vi.fn();
mockLocation.replace = vi.fn();

delete window.location;
window.location = mockLocation;


vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  }),
  Trans: ({ children }) => children
}));