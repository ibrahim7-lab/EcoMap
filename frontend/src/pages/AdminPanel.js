
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { CATEGORIES, STATUSES } from '../constants';

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const loggedIn = Boolean(localStorage.getItem('token'));

  const handleError = useCallback(
    (err) => {
      const message = err.message || 'Something went wrong.';

      if (
        message.toLowerCase().includes('admin login required') ||
        message.toLowerCase().includes('invalid token') ||
        message.toLowerCase().includes('token expired')
      ) {
        localStorage.removeItem('token');
        navigate('/admin/login', { replace: true });
        return;
      }

      setError(message);
    },
    [navigate]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // api.js already adds the /api prefix.
      const result = await api('/reports');
      setReports(Array.isArray(result) ? result : []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    if (loggedIn) {
      load();
    } else {
      setLoading(false);
    }
  }, [loggedIn, load]);

  async function changeStatus(id, status) {
    setError('');
    setUpdatingId(id);

    try {
      await api(`/reports/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      setReports((previous) =>
        previous.map((report) =>
          report.id === id ? { ...report, status } : report
        )
      );
    } catch (err) {
      handleError(err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function remove(id) {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this report? This action cannot be undone.'
    );

    if (!confirmed) return;

    setError('');
    setDeletingId(id);

    try {
      await api(`/reports/${id}`, {
        method: 'DELETE',
      });

      setReports((previous) =>
        previous.filter((report) => report.id !== id)
      );
    } catch (err) {
      handleError(err);
    } finally {
      setDeletingId(null);
    }
  }

  const counts = useMemo(
    () => ({
      total: reports.length,
      pending: reports.filter(
        (report) => report.status === 'Pending Review'
      ).length,
      inProgress: reports.filter(
        (report) => report.status === 'In Progress'
      ).length,
      resolved: reports.filter(
        (report) => report.status === 'Resolved'
      ).length,
      rejected: reports.filter(
        (report) => report.status === 'Rejected'
      ).length,
    }),
    [reports]
  );

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        String(report.title || '').toLowerCase().includes(query) ||
        String(report.category || '').toLowerCase().includes(query) ||
        String(report.id || '').toLowerCase().includes(query) ||
        String(report.location_name || '').toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === 'All Categories' ||
        report.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'All Statuses' ||
        report.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [reports, search, categoryFilter, statusFilter]);

  if (!loggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-copy">
            <span className="admin-eyebrow">
              <span className="admin-eyebrow-dot" />
              ECOMAP MANAGEMENT
            </span>

            <h1>Admin dashboard</h1>

            <p>
              Review community reports, manage their status, and
              monitor environmental issues in your area.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={load}
            disabled={loading}
          >
            <span>↻</span>
            {loading ? 'Refreshing...' : 'Refresh reports'}
          </button>
        </header>

        {error && (
          <div className="admin-alert" role="alert">
            <span>!</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <section
          className="admin-summary-grid"
          aria-label="Report statistics"
        >
          <article className="admin-summary-card admin-summary-total">
            <div className="admin-summary-top">
              <span className="admin-summary-label">Total reports</span>
              <span className="admin-summary-icon">▤</span>
            </div>
            <strong className="admin-summary-value">
              {loading ? '—' : counts.total}
            </strong>
            <span className="admin-summary-caption">
              All submitted reports
            </span>
          </article>

          <article className="admin-summary-card admin-summary-pending">
            <div className="admin-summary-top">
              <span className="admin-summary-label">Pending review</span>
              <span className="admin-summary-icon">◷</span>
            </div>
            <strong className="admin-summary-value">
              {loading ? '—' : counts.pending}
            </strong>
            <span className="admin-summary-caption">
              Awaiting administrator review
            </span>
          </article>

          <article className="admin-summary-card admin-summary-progress">
            <div className="admin-summary-top">
              <span className="admin-summary-label">In progress</span>
              <span className="admin-summary-icon">↗</span>
            </div>
            <strong className="admin-summary-value">
              {loading ? '—' : counts.inProgress}
            </strong>
            <span className="admin-summary-caption">
              Currently being addressed
            </span>
          </article>

          <article className="admin-summary-card admin-summary-resolved">
            <div className="admin-summary-top">
              <span className="admin-summary-label">Resolved</span>
              <span className="admin-summary-icon">✓</span>
            </div>
            <strong className="admin-summary-value">
              {loading ? '—' : counts.resolved}
            </strong>
            <span className="admin-summary-caption">
              Marked as resolved
            </span>
          </article>
        </section>

        <section className="admin-workspace">
          <div className="admin-workspace-heading">
            <div>
              <span className="admin-section-label">
                REPORT MANAGEMENT
              </span>
              <h2>Environmental reports</h2>
              <p>Review submissions and update their progress.</p>
            </div>

            <span className="admin-result-count">
              {filteredReports.length} of {reports.length} reports
            </span>
          </div>

          <div className="admin-filters">
            <div className="admin-search-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Search reports"
                placeholder="Search title, location, category or ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="admin-clear-button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('All Categories');
                setStatusFilter('All Statuses');
              }}
            >
              Clear
            </button>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              <span className="admin-loading-symbol">↻</span>
              <h3>Loading reports</h3>
              <p>Please wait while EcoMap retrieves the submissions.</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="admin-empty-state">
              <span className="admin-empty-icon">⌕</span>
              <h3>
                {reports.length === 0
                  ? 'No reports yet'
                  : 'No matching reports'}
              </h3>
              <p>
                {reports.length === 0
                  ? 'Submitted environmental reports will appear here.'
                  : 'Try another search or clear the filters.'}
              </p>

              {(search ||
                categoryFilter !== 'All Categories' ||
                statusFilter !== 'All Statuses') && (
                <button
                  type="button"
                  className="admin-empty-reset"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('All Categories');
                    setStatusFilter('All Statuses');
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Category</th>
                    <th>Date submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <div className="admin-report-cell">
                          <span className="admin-report-symbol">♧</span>
                          <div>
                            <Link
                              className="admin-report-title"
                              to={`/reports/${report.id}`}
                            >
                              {report.title || 'Untitled report'}
                            </Link>

                            <span className="admin-report-id">
                              Report #{report.id}
                            </span>

                            {report.location_name && (
                              <span className="admin-report-location">
                                {report.location_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-label">
                          {report.category || 'Uncategorized'}
                        </span>
                      </td>

                      <td>
                        <span className="admin-date-label">
                          {report.created_at &&
                          !Number.isNaN(
                            new Date(report.created_at).getTime()
                          )
                            ? new Date(
                                report.created_at
                              ).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>

                      <td>
                        <select
                          className="admin-status-select"
                          aria-label={`Change status for report ${report.id}`}
                          value={report.status}
                          disabled={updatingId === report.id}
                          onChange={(event) =>
                            changeStatus(report.id, event.target.value)
                          }
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === report.id && (
                          <small className="admin-row-hint">
                            Saving...
                          </small>
                        )}
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          <Link
                            className="admin-view-button"
                            to={`/reports/${report.id}`}
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            className="admin-delete-button"
                            disabled={deletingId === report.id}
                            onClick={() => remove(report.id)}
                          >
                            {deletingId === report.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <footer className="admin-workspace-footer">
            <span>
              {counts.pending} report
              {counts.pending === 1 ? '' : 's'} awaiting review
            </span>
            <span>{counts.rejected} rejected</span>
          </footer>
        </section>

        <p className="admin-disclaimer">
          EcoMap is a reporting and awareness prototype. Updating a
          report here does not automatically notify municipal authorities.
        </p>
      </div>
    </main>
  );
}
