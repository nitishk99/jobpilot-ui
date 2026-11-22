export function LoadingState({ label = 'Loading your workspace…' }: { label?: string }) {
  return <div className="state-panel"><span className="spinner" aria-hidden="true" /><span>{label}</span></div>;
}
