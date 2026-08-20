import { Loader } from "@/components/Loader";

type Props = {
  label?: string;
  /** Minimum vertical space for page-level loads. */
  minHeight?: string;
  className?: string;
};

/** Centred loading block for full pages and major sections. */
export function LoadingState({
  label = "Loading…",
  minHeight = "min-h-[40vh]",
  className = "",
}: Props) {
  return (
    <div
      className={`flex items-center justify-center py-16 ${minHeight} ${className}`}
    >
      <Loader size="lg" label={label} />
    </div>
  );
}
