import StateView from "@/components/state-view";

type Props = {
  /** Optional override, e.g. the server's 403 message. */
  message?: string;
};

/**
 * Shown where plan-gated content would render (403 + requires_pro).
 * Deliberately no purchase CTA, price, or link to web pricing — the
 * App Review-safe posture while billing is undecided (mobile_app.md).
 */
export default function ProLockedState({
  message = "This feature isn't included in your current plan.",
}: Props) {
  return <StateView symbol="lock.fill" title="Pro Feature" message={message} />;
}
