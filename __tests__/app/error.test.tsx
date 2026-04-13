import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from '@/app/error';

describe('Error page', () => {
  it('renders the 500 status state', () => {
    render(<ErrorPage error={new Error('boom')} reset={jest.fn()} />);

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /channel disrupted/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
  });

  it('calls reset when retry is clicked', async () => {
    const reset = jest.fn();
    render(<ErrorPage error={new Error('boom')} reset={reset} />);

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
