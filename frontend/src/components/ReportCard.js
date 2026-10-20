import { Link } from 'react-router-dom';

export function StatusBadge({ status }) {
  const cls = 'badge ' + status.toLowerCase().replace(/ /g, '-');
  return <span className={cls}>{status}</span>;
}

export default function ReportCard({ report }) {
  return (
    <div className="card">
      <h3><Link to={'/reports/' + report.id}>{report.title}</Link></h3>
      <p className="muted">
        {report.category} • {new Date(report.created_at).toLocaleDateString()}
      </p>
      <StatusBadge status={report.status} />
    </div>
  );
}
