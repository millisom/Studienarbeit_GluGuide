import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GlucoseChart from '../../src/components/GlucoseChart';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));


vi.mock('recharts', () => ({
  LineChart: ({ children, data }) => (
    <div data-testid="line-chart" data-count={data?.length}>
      {children}
    </div>
  ),
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="container">{children}</div>,
}));

describe('GlucoseChart Component', () => {
  it('renders a no-data message when logs is empty', () => {
    render(<GlucoseChart logs={[]} filter="24hours" />);
    expect(screen.getByText('glucoseChart.noData')).toBeInTheDocument();
  });

  it('renders a chart when logs contain valid data', () => {
    const logs = [
      { date: '2025-05-01', time: '08:00', glucose_level: '90' },
      { date: '2025-05-01', time: '12:00', glucose_level: '120' },
    ];
    render(<GlucoseChart logs={logs} filter="24hours" />);
    const chart = screen.getByTestId('line-chart');
    expect(chart).toBeInTheDocument();
    expect(chart.getAttribute('data-count')).toBe('2');
  });

  it('filters out entries with invalid values', () => {
    const logs = [
      { date: '2025-05-01', time: '08:00', glucose_level: 'abc' },
      { date: '2025-05-01', time: '12:00', glucose_level: '120' },
    ];
    render(<GlucoseChart logs={logs} filter="24hours" />);
    const chart = screen.getByTestId('line-chart');
    expect(chart.getAttribute('data-count')).toBe('1');
  });

  it('renders with 7days filter', () => {
    const logs = [{ date: '2025-05-01', time: '08:00', glucose_level: '90' }];
    render(<GlucoseChart logs={logs} filter="7days" />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
