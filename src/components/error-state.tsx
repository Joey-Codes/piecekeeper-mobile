import StateView from "@/components/state-view";

type Props = {
  title?: string;
  message?: string;
  /** Wire to the failing query's refetch. */
  onRetry?: () => void;
};

/**
 * In-place load-failure state (covers offline too — no global toasts).
 */
export default function ErrorState({
  title = "Couldn't Load",
  message = "Something went wrong. Check your connection and try again.",
  onRetry,
}: Props) {
  return (
    <StateView
      symbol="wifi.exclamationmark"
      title={title}
      message={message}
      action={onRetry ? { label: "Try Again", onPress: onRetry } : undefined}
    />
  );
}
