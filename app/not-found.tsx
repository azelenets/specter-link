import ErrorScreen from '@/components/ErrorScreen';

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Signal Lost"
      description="The route you requested does not exist or is no longer available."
    />
  );
}
