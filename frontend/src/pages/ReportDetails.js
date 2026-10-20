
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { StatusBadge } from '../components/ReportCard';

export default function ReportDetails() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      setLoading(true);
      setError('');

      try {
        // api.js already adds /api to the request URL.
        const data = await api(`/reports/${id}`);

        if (!cancelled) {
          setReport(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load this report.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="report-details-page">
        <div className="report-details-message">
          <p>Loading report details...</p>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="report-details-page">
        <div className="report-details-message">
          <h2>Report not found</h2>
          <p>{error || 'This report could not be found.'}</p>
          <Link to="/map" className="report-details-back">
            Back to Map
          </Link>
        </div>
      </main>
    );
  }

  const imagePath =
    report.image_path || report.image_url || report.image;

  const imageUrl = imagePath
    ? imagePath.startsWith('http')
      ? imagePath
      : `${'http://localhost:5000'}${
          imagePath.startsWith('/uploads/')
            ? imagePath
            : `/uploads/${imagePath.replace(/^\/+/, '')}`
        }`
    : '';

  const submittedDate = report.created_at
    ? new Date(report.created_at).toLocaleString()
    : 'Date unavailable';

  const mapUrl =
    report.latitude != null && report.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
          report.latitude
        )}&mlon=${encodeURIComponent(
          report.longitude
        )}#map=17/${encodeURIComponent(
          report.latitude
        )}/${encodeURIComponent(report.longitude)}`
      : '';

  return (
    <main className="report-details-page">
      <div className="report-details-container">
        <div className="report-details-topbar">
          <Link to="/map" className="report-details-back">
            ← Back to Map
          </Link>

          <span className="report-details-id">
            Report #{report.id || id}
          </span>
        </div>

        <div className="report-details-layout">
          <section className="report-details-main">
            <div className="report-details-heading">
              <div className="report-details-category">
                {report.category || 'Environmental Report'}
              </div>

              <h1>{report.title || 'Untitled Report'}</h1>

              <div className="report-details-meta">
                <span>Submitted {submittedDate}</span>
                <span className="report-details-dot">•</span>
                <span>
                  {report.location_name || 'Location not specified'}
                </span>
              </div>
            </div>

            <div className="report-details-image-wrap">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={report.title || 'Environmental issue'}
                  className="report-details-image"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="report-details-no-image">
                  <span aria-hidden="true">🌿</span>
                  <p>No photo was provided for this report.</p>
                </div>
              )}
            </div>

            <section className="report-details-section">
              <h2>About this issue</h2>
              <p className="report-details-description">
                {report.description || 'No description was provided.'}
              </p>
            </section>

            <section className="report-details-section">
              <h2>Location information</h2>

              <div className="report-location-card">
                <div
                  className="report-location-icon"
                  aria-hidden="true"
                >
                  📍
                </div>

                <div className="report-location-info">
                  <h3>
                    {report.location_name || 'Reported location'}
                  </h3>
                  <p>
                    Latitude: {report.latitude ?? 'Unavailable'}
                  </p>
                  <p>
                    Longitude: {report.longitude ?? 'Unavailable'}
                  </p>
                </div>
              </div>

              {mapUrl && (
                <a
                  className="report-details-map-link"
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View location on OpenStreetMap ↗
                </a>
              )}
            </section>
          </section>

          <aside className="report-details-sidebar">
            <section className="report-details-status-card">
              <h2>Report status</h2>

              <div className="report-details-status-badge">
                <StatusBadge
                  status={report.status || 'Pending Review'}
                />
              </div>

              <p>
                The status shows the current progress recorded in EcoMap.
              </p>
            </section>

            <section className="report-details-info-card">
              <h2>Report summary</h2>

              <div className="report-details-info-row">
                <span>Report ID</span>
                <strong>#{report.id || id}</strong>
              </div>

              <div className="report-details-info-row">
                <span>Category</span>
                <strong>{report.category || 'Other'}</strong>
              </div>

              <div className="report-details-info-row">
                <span>Submitted</span>
                <strong>{submittedDate}</strong>
              </div>

              <div className="report-details-info-row">
                <span>Status</span>
                <strong>
                  {report.status || 'Pending Review'}
                </strong>
              </div>
            </section>

            <section className="report-details-note">
              <span aria-hidden="true">ℹ️</span>
              <p>
                EcoMap reports are community submissions. A displayed
                status does not by itself confirm that a municipal
                authority has verified or resolved the issue.
              </p>
            </section>

            <Link
              to="/map"
              className="report-details-map-button"
            >
              Explore reports on the map
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
