import { vi } from 'vitest';
import React from 'react';

// i18n global mocken für alle folgenden Komponenten
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' }
  }),
  Trans: ({ children }) => children
}));

// Mock react-select
vi.mock('react-select', () => ({
  default: ({ placeholder, onChange, options }) => (
    <div data-testid="select-mock">
      <input
        data-testid="select-input"
        placeholder={placeholder}
        onChange={(e) => onChange([{ value: e.target.value, label: e.target.value }])}
      />
      <div data-testid="select-options">
        {options?.map((opt) => (
          <div key={opt.value} data-testid={`option-${opt.value}`}>{opt.label}</div>
        ))}
      </div>
    </div>
  )
}));

// Mock ViewBlogEntries (Safe Version)
vi.mock('../../src/components/ViewBlogEntries', () => ({
  default: () => <div data-testid="mock-view-blog-entries">Safe Mock ViewBlogEntries</div>
}));

// Mock BlogCard
vi.mock('../../src/components/BlogCard', () => ({
  default: ({ blog }) => (
    <div data-testid={`blog-card-${blog?.id || 'unknown'}`}>
      <h3>{blog?.title || 'Untitled'}</h3>
      <div>{blog?.content || 'No content'}</div>
    </div>
  )
}));