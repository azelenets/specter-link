import { render, screen } from '@testing-library/react';
import VideoPanel from '@/components/VideoPanel';

describe('VideoPanel — idle state (callActive=false)', () => {
  it('shows "No Active Call" placeholder', () => {
    render(<VideoPanel localStream={null} remoteStream={null} callActive={false} />);
    expect(screen.getByText(/no active call/i)).toBeInTheDocument();
  });

  it('shows toolbar hint text', () => {
    render(<VideoPanel localStream={null} remoteStream={null} callActive={false} />);
    expect(screen.getByText(/use the toolbar/i)).toBeInTheDocument();
  });

  it('renders no video elements', () => {
    const { container } = render(
      <VideoPanel localStream={null} remoteStream={null} callActive={false} />,
    );
    expect(container.querySelectorAll('video')).toHaveLength(0);
  });
});

describe('VideoPanel — active call (callActive=true)', () => {
  it('renders the remote video element', () => {
    const { container } = render(
      <VideoPanel localStream={null} remoteStream={null} callActive={true} />,
    );
    expect(container.querySelector('.video-remote')).toBeInTheDocument();
  });

  it('shows "Waiting for remote stream" overlay when remoteStream is null', () => {
    render(<VideoPanel localStream={null} remoteStream={null} callActive={true} />);
    expect(screen.getByText(/waiting for remote stream/i)).toBeInTheDocument();
  });

  it('hides the waiting overlay when remoteStream is provided', () => {
    render(
      <VideoPanel localStream={null} remoteStream={{} as MediaStream} callActive={true} />,
    );
    expect(screen.queryByText(/waiting for remote stream/i)).not.toBeInTheDocument();
  });

  it('shows local PiP video when localStream is provided', () => {
    const { container } = render(
      <VideoPanel localStream={{} as MediaStream} remoteStream={null} callActive={true} />,
    );
    expect(container.querySelector('.video-local')).toBeInTheDocument();
  });

  it('hides local PiP when localStream is null', () => {
    const { container } = render(
      <VideoPanel localStream={null} remoteStream={null} callActive={true} />,
    );
    expect(container.querySelector('.video-local')).not.toBeInTheDocument();
  });
});
