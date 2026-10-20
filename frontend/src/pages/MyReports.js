
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, logoutUser } from '../api';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadReports() {
      if (!localStorage.getItem('userToken')) {
        setError('Please log in to view your reports.');
        setLoading(false);
        return;
      }

      try {
        const data = await api('/users/me/reports');

        if (active) setReports(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    logoutUser();
    window.dispatchEvent(new Event('storage'));
    window.location.href = '/login';
  }

  if (loading) {
    return <section className="my-reports-page"><p>Loading your reports...</p></section>;
  }

  if (error) {
    return (
      <section className="my-reports-page">
        <div className="my-reports-heading">
          <h1>My Reports</h1>
        </div>
        <div className="auth-error">{error}</div>
        <Link className="btn" to="/login">Log in</Link>
      </section>
    );
  }

  return (
    <section className="my-reports-page">
      <div className="my-reports-heading">
        <div>
          <p className="eyebrow">YOUR CONTRIBUTION</p>
          <h1>My Reports</h1>
          <p>Track the environmental issues you've submitted.</p>
        </div>

        <button className="btn btn-secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="my-reports-empty">
          <div className="auth-icon">🌍</div>
          <h2>No reports yet</h2>
          <p>Spot an environmental issue? Help your community by reporting it.</p>
          <Link className="btn" to="/report">Report an issue</Link>
        </div>
      ) : (
        <>
          <p className="my-reports-count">
            {reports.length} {reports.length === 1 ? 'report' : 'reports'}
          </p>

          <div className="my-reports-list">
            {reports.map((report) => (
              <article className="my-report-card" key={report.id}>
                {report.image_path && (
                  <img
                    className="my-report-image"
                    src={`http://localhost:5000/uploads/${encodeURIComponent(report.image_path)}`}
                    alt={report.title}
                  />
                )}

                <div className="my-report-content">
                  <span className="my-report-category">{report.category}</span>
                  <h2>
                    <Link to={`/reports/${report.id}`}>{report.title}</Link>
                  </h2>

                  <p>{report.description}</p>

                  {report.location_name && (
                    <p className="my-report-location">
                      📍 {report.location_name}
                    </p>
                  )}

                  <div className="my-report-footer">
                    <span className="my-report-status">{report.status}</span>
                    <Link to={`/reports/${report.id}`}>View details →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="my-reports-actions">
        <Link to="/report">+ Submit another report</Link>
        <Link to="/map">Explore the map</Link>
      </div>
    </section>
  );
}
