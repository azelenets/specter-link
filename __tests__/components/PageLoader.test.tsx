import { render, screen, waitFor } from '@testing-library/react';
import PageLoader from '@/components/PageLoader';

// next/dynamic with ssr:false resolves synchronously in the jest/jsdom environment
// (next/jest wires this up via the `next/dist/client/components/not-found` transform).
// We mock the dynamically-loaded PageContent so the test is not coupled to hook behaviour.

jest.mock('@/components/PageContent', () => {
  const MockPageContent = () => <div data-testid="page-content" />;
  MockPageContent.displayName = 'MockPageContent';
  return MockPageContent;
});

describe('PageLoader', () => {
  it('renders without crashing', () => {
    render(<PageLoader />);
  });

  it('renders PageContent', async () => {
    render(<PageLoader />);
    await waitFor(() => {
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });
  });
});
