import { AlertCircle, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '../../api/errors';

export function ErrorState({ error, onRetry, title = 'We couldn’t load this data' }: { error?: unknown; onRetry?: () => void; title?: string }) {
  return (
    <div className="state-panel state-panel-error">
      <span className="state-icon error-icon"><AlertCircle size={19} /></span>
      <div><strong>{title}</strong><p>{getErrorMessage(error)}</p></div>
      {onRetry && <button className="button button-secondary button-small" onClick={onRetry}><RefreshCw size={14} /> Try again</button>}
    </div>
  );
}
