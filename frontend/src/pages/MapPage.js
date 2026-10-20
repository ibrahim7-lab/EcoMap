
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Tooltip,
  useMap,
} from 'react-leaflet';

import { api } from '../api';
import {
  CATEGORIES,
  STATUSES,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from '../constants';
import ReportCard from '../components/ReportCard';

function MapRecenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1 });
  }, [position, map]);

  return null;
}

function distanceMeters(a, b) {
  const rad = (degrees) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;

  const lat1 = rad(a.latitude);
  const lat2 = rad(b.latitude);
  const deltaLat = rad(b.latitude - a.latitude);
  const deltaLng = rad(b.longitude - a.longitude);

  const h =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(Math.min(1, h)));
}

function calculateHotspots(reports, radiusMeters = 500) {
  const points = reports
    .map((report) => ({
      ...report,
      latitude: Number(report.latitude),
      longitude: Number(report.longitude),
    }))
    .filter(
      (report) =>
        Number.isFinite(report.latitude) &&
        Number.isFinite(report.longitude) &&
        Math.abs(report.latitude) <= 90 &&
        Math.abs(report.longitude) <= 180
    );

  const visited = new Set();
  const hotspots = [];

  points.forEach((point, index) => {
    if (visited.has(index)) return;

    const cluster = [point];
    visited.add(index);

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) continue;

      if (
        cluster.some(
          (member) => distanceMeters(member, points[i]) <= radiusMeters
        )
      ) {
        cluster.push(points[i]);
        visited.add(i);
        i = -1;
      }
    }

    if (cluster.length >= 2) {
      hotspots.push({
        id: cluster.map((report) => report.id).sort().join('-'),
        latitude:
          cluster.reduce((sum, report) => sum + report.latitude, 0) /
          cluster.length,
        longitude:
          cluster.reduce((sum, report) => sum + report.longitude, 0) /
          cluster.length,
        count: cluster.length,
        reports: cluster,
      });
    }
  });

  return hotspots;
}

export default function MapPage() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    from: '',
    to: '',
  });

  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);

  const invalidDateRange =
    Boolean(filters.from && filters.to && filters.from > filters.to);

  function change(event) {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  }

  function clearFilters() {
    setFilters({
      search: '',
      category: '',
      status: '',
      from: '',
      to: '',
    });
  }

  useEffect(() => {
    if (invalidDateRange) {
      setReports([]);
      setError('');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    async function loadReports() {
      setLoading(true);
      setError('');

      try {
        // api.js adds /api, so do not include it here.
        const data = await api(`/reports?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!Array.isArray(data)) {
          throw new Error('Unexpected reports response.');
        }

        setReports(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load reports.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadReports();
    return () => controller.abort();
  }, [filters, invalidDateRange]);

  const hotspots = useMemo(
    () => calculateHotspots(reports),
    [reports]
  );

  function locateMe() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
        setLocating(false);
      },
      (err) => {
        const messages = {
          1: 'Location permission was denied. Allow location access in your browser settings.',
          2: 'Your location could not be determined. Check your device location settings.',
          3: 'The location request timed out. Please try again.',
        };

        setLocationError(
          messages[err.code] || 'Unable to get your location.'
        );
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <main className="map-page">
      <header className="map-page-header">
        <div>
          <span className="map-filter-eyebrow">
            EXPLORE YOUR COMMUNITY
          </span>
          <h1>Environmental Issue Map</h1>
          <p className="muted">
            Discover reported environmental issues and identify
            areas where multiple reports have been submitted.
          </p>
        </div>

        <Link to="/report" className="btn map-report-button">
          + Report Issue
        </Link>
      </header>

      <section className="map-filter-panel">
        <div className="map-filter-header">
          <div>
            <h2>Find environmental issues</h2>
            <p>Search reports and narrow the results using filters.</p>
          </div>

          <button
            type="button"
            className="map-clear-button"
            onClick={clearFilters}
          >
            ↺ Clear filters
          </button>
        </div>

        <div className="map-search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            name="search"
            placeholder="Search by title, description or location..."
            aria-label="Search reports"
            value={filters.search}
            onChange={change}
          />
        </div>

        <div className="map-filter-grid">
          <div className="map-filter-field">
            <label htmlFor="map-category">Issue category</label>
            <select
              id="map-category"
              name="category"
              value={filters.category}
              onChange={change}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="map-filter-field">
            <label htmlFor="map-status">Report status</label>
            <select
              id="map-status"
              name="status"
              value={filters.status}
              onChange={change}
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="map-filter-field">
            <label htmlFor="map-from">From date</label>
            <input
              id="map-from"
              type="date"
              name="from"
              max={filters.to || undefined}
              value={filters.from}
              onChange={change}
            />
          </div>

          <div className="map-filter-field">
            <label htmlFor="map-to">To date</label>
            <input
              id="map-to"
              type="date"
              name="to"
              min={filters.from || undefined}
              value={filters.to}
              onChange={change}
            />
          </div>
        </div>

        <div className="map-filter-footer">
          <span className="map-results-indicator">
            <span className="map-results-dot" />
            {invalidDateRange
              ? 'Invalid date range'
              : loading
                ? 'Loading reports...'
                : `${reports.length} reports found`}
          </span>
          <span className="map-filter-hint">
            Results update automatically
          </span>
        </div>
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      <section className="location-controls map-location-panel">
        <div>
          <h2>Explore nearby</h2>
          <p className="muted">
            Center the map on your current location.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={locateMe}
          disabled={locating}
        >
          {locating ? 'Finding location...' : '📍 Locate Me'}
        </button>

        {userPosition && (
          <p className="muted map-coordinates">
            Your location: {userPosition[0].toFixed(5)},{' '}
            {userPosition[1].toFixed(5)}
          </p>
        )}

        {locationError && (
          <p className="error" role="alert">{locationError}</p>
        )}
      </section>

      <div className="hotspot-legend">
        <span className="hotspot-legend-dot" />
        <span>
          Hotspots show clusters of 2 or more reports within
          approximately 500 metres.
        </span>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter position={userPosition} />

        {hotspots.map((hotspot) => (
          <CircleMarker
            key={hotspot.id}
            center={[hotspot.latitude, hotspot.longitude]}
            radius={Math.min(12 + hotspot.count * 2, 28)}
            pathOptions={{
              color: '#b91c1c',
              fillColor: '#ef4444',
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Tooltip>Hotspot: {hotspot.count} reports</Tooltip>
            <Popup>
              <h3>Environmental Hotspot</h3>
              <p>
                <strong>{hotspot.count}</strong> reports within
                approximately 500 metres.
              </p>
              <ul>
                {hotspot.reports.map((report) => (
                  <li key={report.id}>
                    <Link to={`/reports/${report.id}`}>
                      {report.title}
                    </Link>
                    {' — '}{report.category}
                  </li>
                ))}
              </ul>
            </Popup>
          </CircleMarker>
        ))}

        {reports
          .filter((report) => {
            const lat = Number(report.latitude);
            const lng = Number(report.longitude);
            return (
              Number.isFinite(lat) &&
              Number.isFinite(lng) &&
              Math.abs(lat) <= 90 &&
              Math.abs(lng) <= 180
            );
          })
          .map((report) => (
            <Marker
              key={report.id}
              position={[
                Number(report.latitude),
                Number(report.longitude),
              ]}
            >
              <Popup>
                <strong>{report.title}</strong>
                <br />
                {report.category}
                <br />
                {report.location_name}
                <br />
                {report.created_at &&
                  new Date(report.created_at).toLocaleDateString()}
                {' • '}{report.status}
                <br />
                <Link to={`/reports/${report.id}`}>View details</Link>
              </Popup>
            </Marker>
          ))}

        {userPosition && (
          <Marker position={userPosition}>
            <Popup>
              <strong>Your current location</strong>
              <br />
              You are here.
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <section className="map-report-list">
        <div className="map-report-list-header">
          <div>
            <h2>Environmental reports</h2>
            <p className="muted">
              Browse the reports matching your filters.
            </p>
          </div>
          <span className="map-list-count">{reports.length}</span>
        </div>

        {invalidDateRange ? (
          <p className="muted">
            Choose a valid date range to view reports.
          </p>
        ) : loading ? (
          <p className="muted">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="map-empty-state">
            <span>🌱</span>
            <h3>No reports found</h3>
            <p>Try changing your search or clearing the filters.</p>
            <button
              type="button"
              className="map-clear-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
