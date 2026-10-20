
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function StatusChart({ stats }) {
  const other = Math.max(
    0,
    stats.total - stats.pending - stats.inProgress - stats.resolved
  );

  const segments = [
    { label: 'Pending Review', value: stats.pending, color: '#f59e0b' },
    { label: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { label: 'Resolved', value: stats.resolved, color: '#10b981' },
    { label: 'Other active', value: other, color: '#94a3b8' },
  ];

  let current = 0;

  const gradient = segments.map((segment) => {
    const start = current;
    current += stats.total > 0
      ? (segment.value / stats.total) * 100
      : 0;

    return `${segment.color} ${start}% ${current}%`;
  });

  return (
    <div className="status-chart-layout">
      <div
        className="status-donut"
        style={{
          background: stats.total
            ? `conic-gradient(${gradient.join(', ')})`
            : '#e5e7eb',
        }}
        role="img"
        aria-label={`Status distribution across ${stats.total} reports`}
      >
        <div className="status-donut-hole">
          <strong>{stats.total}</strong>
          <span>Total reports</span>
        </div>
      </div>

      <div className="status-legend">
        {segments.map((segment) => (
          <div className="legend-item" key={segment.label}>
            <span
              className="legend-dot"
              style={{ background: segment.color }}
            />
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // api.js already adds /api to the URL.
      const data = await api('/stats');
      setStats(data);
    } catch (err) {
      setError(err.message || 'Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const categories = stats?.byCategory || [];

  const maxCategory = Math.max(
    1,
    ...categories.map((category) => Number(category.count))
  );

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">ECOMAP OVERVIEW</p>
          <h1>Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Track environmental reports and their progress.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </header>

      {error && (
        <div className="error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadStats}>
            Try again
          </button>
        </div>
      )}

      {loading && !stats && <p>Loading dashboard...</p>}

      {stats && (
        <>
          <section
            className="dashboard-stats"
            aria-label="Report statistics"
          >
            <article className="dashboard-stat stat-total">
              <span className="stat-icon">🌍</span>
              <p>Total reports</p>
              <strong>{stats.total}</strong>
              <span>Publicly visible reports</span>
            </article>

            <article className="dashboard-stat stat-pending">
              <span className="stat-icon">⏳</span>
              <p>Pending review</p>
              <strong>{stats.pending}</strong>
              <span>Awaiting action</span>
            </article>

            <article className="dashboard-stat stat-progress">
              <span className="stat-icon">🔄</span>
              <p>In progress</p>
              <strong>{stats.inProgress}</strong>
              <span>Being addressed</span>
            </article>

            <article className="dashboard-stat stat-resolved">
              <span className="stat-icon">✓</span>
              <p>Resolved</p>
              <strong>{stats.resolved}</strong>
              <span>Marked as resolved</span>
            </article>
          </section>

          <section className="dashboard-panels">
            <article className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Reports by category</h2>
                  <p>Compare the number of reports for each issue.</p>
                </div>
              </div>

              {categories.length === 0 ? (
                <p className="muted">
                  No category data available yet.
                </p>
              ) : (
                <div className="category-chart">
                  {categories.map((category) => {
                    const count = Number(category.count);
                    const width = (count / maxCategory) * 100;

                    return (
                      <div
                        className="category-row"
                        key={category.category}
                      >
                        <div className="category-row-heading">
                          <span>{category.category}</span>
                          <strong>{count}</strong>
                        </div>

                        <div
                          className="category-track"
                          role="progressbar"
                          aria-label={`${category.category} reports`}
                          aria-valuenow={count}
                          aria-valuemin={0}
                          aria-valuemax={maxCategory}
                        >
                          <div
                            className="category-fill"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Report status</h2>
                  <p>See the current distribution of reports.</p>
                </div>
              </div>

              <StatusChart stats={stats} />
            </article>
          </section>

          <section className="dashboard-panel recent-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent reports</h2>
                <p>The five latest publicly visible reports.</p>
              </div>

              <Link to="/map">View map →</Link>
            </div>

            {(stats.recent || []).length === 0 ? (
              <p className="muted">
                No reports have been submitted yet.
              </p>
            ) : (
              <div className="recent-table-wrapper">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Report</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stats.recent.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <Link to={`/reports/${report.id}`}>
                            {report.title}
                          </Link>
                        </td>

                        <td>{report.category}</td>

                        <td>
                          <span
                            className={
                              'report-status status-' +
                              report.status
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '')
                            }
                          >
                            {report.status}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            report.created_at
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
