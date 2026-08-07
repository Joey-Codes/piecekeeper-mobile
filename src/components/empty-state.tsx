import type { SFSymbol } from "sf-symbols-typescript";

import StateView from "@/components/state-view";

type Props = {
  symbol?: SFSymbol;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
};

/** Designed empty state: symbol + title + supporting text + optional action. */
export default function EmptyState({ symbol = "tray", ...rest }: Props) {
  return <StateView symbol={symbol} {...rest} />;
}
