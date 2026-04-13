import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '@/components/Chat';
import type { Message } from '@/hooks/usePeer';

const msg = (text: string, fromSelf: boolean): Message => ({
  text,
  fromSelf,
  timestamp: 0,
});

const onSend = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('Chat — message list', () => {
  it('shows empty-state text when there are no messages', () => {
    render(<Chat messages={[]} onSend={onSend} />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('renders message text', () => {
    render(<Chat messages={[msg('Hello', true), msg('Hi', false)]} onSend={onSend} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('applies message-self class to own messages', () => {
    render(<Chat messages={[msg('Hey', true)]} onSend={onSend} />);
    expect(screen.getByText('Hey')).toHaveClass('message-self');
  });

  it('applies message-peer class to remote messages', () => {
    render(<Chat messages={[msg('Hey', false)]} onSend={onSend} />);
    expect(screen.getByText('Hey')).toHaveClass('message-peer');
  });

  it('shows correct message count', () => {
    const messages = [msg('a', true), msg('b', false), msg('c', true)];
    render(<Chat messages={messages} onSend={onSend} />);
    expect(screen.getByText(/3 msg/i)).toBeInTheDocument();
  });

  it('shows singular "msg" for one message', () => {
    render(<Chat messages={[msg('a', true)]} onSend={onSend} />);
    expect(screen.getByText('1 msg')).toBeInTheDocument();
  });
});

describe('Chat — input and send', () => {
  it('Send button is disabled when input is empty', () => {
    render(<Chat messages={[]} onSend={onSend} />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('Send button is enabled when input has text', async () => {
    render(<Chat messages={[]} onSend={onSend} />);
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), 'Hello');
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
  });

  it('calls onSend with the message text', async () => {
    render(<Chat messages={[]} onSend={onSend} />);
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('clears the input after sending', async () => {
    render(<Chat messages={[]} onSend={onSend} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    await userEvent.type(input, 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(input).toHaveValue('');
  });

  it('sends on Enter key', async () => {
    render(<Chat messages={[]} onSend={onSend} />);
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), 'Hello{Enter}');
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not send on Shift+Enter', async () => {
    render(<Chat messages={[]} onSend={onSend} />);
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), 'Hello');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not call onSend for whitespace-only input', async () => {
    render(<Chat messages={[]} onSend={onSend} />);
    await userEvent.type(screen.getByPlaceholderText(/type a message/i), '   {Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });
});
