import { BriefcaseBusiness, CheckCircle2, MessageSquareText, Trophy } from 'lucide-react';
import type { ApplicationStats as Stats } from './application.types';

export function ApplicationStats({ stats }: { stats: Stats }) {
  const items = [
    { label: 'In progress', value: stats.inProgress, icon: BriefcaseBusiness, tone: 'blue' },
    { label: 'Interviewing', value: stats.interviewing, icon: MessageSquareText, tone: 'violet' },
    { label: 'Offers', value: stats.offers, icon: Trophy, tone: 'green' },
    { label: 'Newly applied', value: stats.newlyApplied, icon: CheckCircle2, tone: 'amber' },
  ];

  return (
    <section className="workspace-pulse" aria-label="Application overview">
      <div className="pulse-lead">
        <span className="pulse-label">PIPELINE</span>
        <strong>{stats.total.toString().padStart(2, '0')}</strong>
        <p>opportunities tracked</p>
      </div>
      <div className="pulse-stats">
        {items.map(({ label, value, icon: Icon, tone }) => (
          <div className="pulse-stat" key={label}>
            <span className={`stat-icon ${tone}`}><Icon size={18} /></span>
            <div><strong>{value}</strong><span>{label}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
}
