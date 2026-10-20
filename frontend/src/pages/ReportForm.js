
import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import { api } from '../api';
import { CATEGORIES, DEFAULT_CENTER, DEFAULT_ZOOM } from '../constants';

function MapRecenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 0.8 });
    }
  }, [position, map]);

  return null;
}

function LocationPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(
        event.latlng.lat.toFixed(7),
        event.latlng.lng.toFixed(7)
      );
    },
  });

  return null;
}

export default function ReportForm() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location_name: '',
    latitude: '',
    longitude: '',
  });

  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const hasPoint =
    form.latitude.trim() !== '' &&
    form.longitude.trim() !== '' &&
    Number.isFinite(Number(form.latitude)) &&
    Number.isFinite(Number(form.longitude)) &&
    Math.abs(Number(form.latitude)) <= 90 &&
    Math.abs(Number(form.longitude)) <= 180;

  const position = hasPoint
    ? [Number(form.latitude), Number(form.longitude)]
    : null;

  function change(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
  }

  function pickLocation(latitude, longitude) {
    setForm((previous) => ({
      ...previous,
      latitude,
      longitude,
    }));

    setLocationError('');
    setError('');
  }

  function getMyLocation() {
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError(
        'Your browser does not support location detection.'
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        pickLocation(
          result.coords.latitude.toFixed(7),
          result.coords.longitude.toFixed(7)
        );
        setLocating(false);
      },
      (err) => {
        const messages = {
          1: 'Location permission denied. Allow location access in your browser settings.',
          2: 'Your location could not be determined. Check your device location settings.',
          3: 'The location request timed out. Please try again.',
        };

        setLocationError(
          messages[err.code] || 'Could not detect your location.'
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

  function selectImage(event) {
    const file = event.target.files?.[0] || null;

    setError('');
    setMessage('');

    if (!file) {
      setImage(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('The image must be 2 MB or smaller.');
      event.target.value = '';
      setImage(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG or WEBP image.');
      event.target.value = '';
      setImage(null);
      return;
    }

    setImage(file);
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (
      !form.title.trim() ||
      !form.category ||
      !form.description.trim()
    ) {
      setError('Please fill in the title, category and description.');
      return;
    }

    if (form.title.trim().length > 150) {
      setError('The title must be 150 characters or fewer.');
      return;
    }

    if (!CATEGORIES.includes(form.category)) {
      setError('Please select a valid environmental category.');
      return;
    }

    if (!hasPoint) {
      setError(
        'Please select a valid location using the map or Get My Location.'
      );
      return;
    }

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (image) {
      data.append('image', image);
    }

    setSaving(true);

    try {
      // api.js already adds /api to the request URL.
      const result = await api('/reports', {
        method: 'POST',
        body: data,
      });

      setMessage(
        `${result.message || 'Report submitted successfully.'} Your report will remain Pending Review until an admin checks it.`
      );

      setForm({
        title: '',
        category: '',
        description: '',
        location_name: '',
        latitude: '',
        longitude: '',
      });

      setImage(null);

      const fileInput = document.getElementById('image');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.message || 'Could not submit your report.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="report-form-page">
      <div className="report-form-container">
        <header className="report-form-header">
          <span className="report-form-eyebrow">
            <span className="report-form-eyebrow-dot" />
            MAKE A DIFFERENCE
          </span>

          <h1>Report an Environmental Issue</h1>

          <p>
            Spotted something harming the environment? Tell us about it.
            Your report helps your community take action for a cleaner,
            greener future.
          </p>

          <div className="report-form-steps">
            <div className="report-form-step">
              <span>01</span>
              <div>
                <strong>Describe</strong>
                <small>Tell us what happened</small>
              </div>
            </div>

            <div className="report-form-step">
              <span>02</span>
              <div>
                <strong>Pin location</strong>
                <small>Show us where</small>
              </div>
            </div>

            <div className="report-form-step">
              <span>03</span>
              <div>
                <strong>Submit</strong>
                <small>Send your report</small>
              </div>
            </div>
          </div>
        </header>

        <form className="report-form-card" onSubmit={submit}>
          <div className="report-form-card-heading">
            <div>
              <span className="report-form-section-number">01</span>
              <h2>Issue information</h2>
              <p>Give your report a clear title and description.</p>
            </div>

            <span className="report-form-required">
              * Required fields
            </span>
          </div>

          <div className="report-form-fields">
            <div className="report-form-field">
              <label htmlFor="title">
                Issue title <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                maxLength={150}
                value={form.title}
                onChange={change}
                placeholder="e.g. Garbage dumped near the road"
                required
              />

              <small>Keep it short and descriptive.</small>
            </div>

            <div className="report-form-field">
              <label htmlFor="category">
                Environmental category <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={form.category}
                onChange={change}
                required
              >
                <option value="">Select an issue category</option>

                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="report-form-field">
              <label htmlFor="description">
                Description <span>*</span>
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={3000}
                value={form.description}
                onChange={change}
                placeholder="Describe the issue, its severity, and any details that could help..."
                required
              />

              <div className="report-form-character-count">
                <span>
                  Provide enough detail to help resolve the issue.
                </span>
                <span>{form.description.length}/3000</span>
              </div>
            </div>

            <div className="report-form-field">
              <label htmlFor="location_name">
                Location name
                <span className="report-form-optional">OPTIONAL</span>
              </label>

              <input
                id="location_name"
                name="location_name"
                value={form.location_name}
                onChange={change}
                placeholder="e.g. Near the college gate"
              />
            </div>
          </div>

          <div className="report-form-divider" />

          <section className="report-form-location-section">
            <div className="report-form-card-heading">
              <div>
                <span className="report-form-section-number">02</span>
                <h2>Pin the issue location</h2>
                <p>
                  Select the exact location so the issue can be found.
                </p>
              </div>
            </div>

            <div className="report-form-map-toolbar">
              <div className="report-form-map-instructions">
                <span className="report-form-map-pin">⌖</span>
                <div>
                  <strong>
                    {position ? 'Location selected' : 'Choose a location'}
                  </strong>
                  <small>
                    Click anywhere on the map to place or move the pin.
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="report-form-location-button"
                onClick={getMyLocation}
                disabled={locating}
              >
                {locating ? 'Locating...' : '◎ Use my location'}
              </button>
            </div>

            {locationError && (
              <p className="report-form-error" role="alert">
                {locationError}
              </p>
            )}

            <div className="report-form-map-wrap">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                className="report-form-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapRecenter position={position} />
                <LocationPicker onPick={pickLocation} />

                {position && <Marker position={position} />}
              </MapContainer>
            </div>

            <div className="report-form-coordinates">
              <div className="report-form-field">
                <label htmlFor="latitude">
                  Latitude <span>*</span>
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={form.latitude}
                  onChange={change}
                  placeholder="e.g. 19.2183"
                  required
                />
              </div>

              <div className="report-form-field">
                <label htmlFor="longitude">
                  Longitude <span>*</span>
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={form.longitude}
                  onChange={change}
                  placeholder="e.g. 72.9781"
                  required
                />
              </div>
            </div>

            <p className="report-form-coordinate-note">
              {position
                ? `Selected coordinates: ${form.latitude}, ${form.longitude}`
                : 'Choose a point on the map or use your device location.'}
            </p>
          </section>

          <div className="report-form-divider" />

          <section className="report-form-upload-section">
            <div className="report-form-card-heading">
              <div>
                <span className="report-form-section-number">03</span>
                <h2>Add photographic evidence</h2>
                <p>
                  A photo can help reviewers understand the problem.
                </p>
              </div>

              <span className="report-form-required">Optional</span>
            </div>

            <label
              className={`report-form-upload-area ${
                image ? 'has-image' : ''
              }`}
              htmlFor="image"
            >
              {image ? (
                <div className="report-form-image-preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Selected environmental issue"
                  />

                  <div className="report-form-image-info">
                    <strong>{image.name}</strong>
                    <small>
                      {(image.size / 1024).toFixed(0)} KB · Ready to upload
                    </small>
                    <span>Click to change photo</span>
                  </div>
                </div>
              ) : (
                <>
                  <span className="report-form-upload-icon">↑</span>
                  <strong>Click to upload a photo</strong>
                  <span>or select an image from your device</span>
                  <small>JPG, PNG or WEBP · Maximum 2 MB</small>
                </>
              )}

              <input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectImage}
              />
            </label>
          </section>

          {error && (
            <div
              className="report-form-alert report-form-alert-error"
              role="alert"
            >
              <strong>Unable to submit report</strong>
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div
              className="report-form-alert report-form-alert-success"
              role="status"
            >
              <strong>Report submitted</strong>
              <p>{message}</p>
            </div>
          )}

          <div className="report-form-footer">
            <div className="report-form-privacy">
              <span>✓</span>
              <p>
                Please provide accurate information to help your community.
              </p>
            </div>

            <button
              className="report-form-submit"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Submitting report...'
                : 'Submit environmental report'}
              {!saving && <span>→</span>}
            </button>
          </div>
        </form>

        <p className="report-form-bottom-note">
          Every report is reviewed before its status is updated.
          Thank you for helping make our environment better.
        </p>
      </div>
    </main>
  );
}
