
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import ReportCard from '../components/ReportCard';

const features = [
  {
    icon: '📍',
    title: 'Explore your area',
    description:
      'Discover environmental issues reported around your neighbourhood on an interactive map.',
    link: '/map',
    linkText: 'Explore map',
  },
  {
    icon: '🌱',
    title: 'Make a difference',
    description:
      'Report garbage dumping, water pollution, leaks and other environmental problems.',
    link: '/report',
    linkText: 'Submit a report',
  },
  {
    icon: '📊',
    title: 'Track progress',
    description:
      'See reported issues and follow their progress towards resolution.',
    link: '/dashboard',
    linkText: 'View dashboard',
  },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      setLoading(true);
      setError('');

      try {
        // api.js already adds the /api prefix.
        const [statsResult, reportsResult] = await Promise.all([
          api('/stats'),
          api('/reports'),
        ]);

        if (!active) return;

        setStats(statsResult);
        setRecent(
          Array.isArray(reportsResult)
            ? reportsResult.slice(0, 3)
            : []
        );
      } catch (e) {
        if (active) {
          setError(e.message || 'Unable to load EcoMap data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      active = false;
    };
  }, []);

  const statItems = stats
    ? [
        { label: 'Reports submitted', value: stats.total, icon: '📋' },
        { label: 'Awaiting review', value: stats.pending, icon: '🕒' },
        { label: 'In progress', value: stats.inProgress, icon: '🔄' },
        { label: 'Issues resolved', value: stats.resolved, icon: '✅' },
      ]
    : [];

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            🌍 YOUR NEIGHBOURHOOD, YOUR ENVIRONMENT
          </span>

          <h1>
            A cleaner planet
            <br />
            starts <span>right here.</span>
          </h1>

          <p className="home-hero-description">
            Spot an environmental issue? Report it, locate it on the map,
            and help your community work towards a cleaner, greener future.
          </p>

          <div className="home-hero-actions">
            <Link to="/report" className="btn home-primary-btn">
              <span aria-hidden="true">＋</span> Report an issue
            </Link>

            <Link to="/map" className="btn btn-light home-secondary-btn">
              Explore the map <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="home-hero-note">
            <span className="home-live-dot" />
            Community-powered environmental awareness
          </div>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="home-orbit home-orbit-one" />
          <div className="home-orbit home-orbit-two" />
          <div className="home-planet">🌎</div>

          <div className="home-float-card home-float-card-top">
            <span>🌿</span>
            <div>
              <strong>Think green</strong>
              <small>Act locally</small>
            </div>
          </div>

          <div className="home-float-card home-float-card-bottom">
            <span>♻️</span>
            <div>
              <strong>Small actions</strong>
              <small>Big impact</small>
            </div>
          </div>

          <span className="home-leaf home-leaf-one">🌱</span>
          <span className="home-leaf home-leaf-two">🍃</span>
        </div>
      </section>

      <section className="home-stats-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-eyebrow">
              THE COMMUNITY IMPACT
            </span>
            <h2>Progress at a glance</h2>
            <p>
              Every report is a step towards a healthier environment.
            </p>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <div className="home-loading">
            Loading community statistics…
          </div>
        ) : stats ? (
          <div className="home-stats-grid">
            {statItems.map((item) => (
              <div className="home-stat-card" key={item.label}>
                <div className="home-stat-icon">{item.icon}</div>
                <div className="home-stat-value">{item.value ?? 0}</div>
                <div className="home-stat-label">{item.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">Statistics are temporarily unavailable.</p>
        )}
      </section>

      <section className="home-features-section">
        <div className="home-section-heading">
          <div>
            <span className="home-section-eyebrow">HOW ECOMAP WORKS</span>
            <h2>Turn awareness into action</h2>
            <p>Three simple ways to help your community.</p>
          </div>
        </div>

        <div className="home-features-grid">
          {features.map((feature, index) => (
            <article className="home-feature-card" key={feature.title}>
              <div className="home-feature-top">
                <div className="home-feature-icon">{feature.icon}</div>
                <span className="home-feature-number">
                  0{index + 1}
                </span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <Link to={feature.link} className="home-feature-link">
                {feature.linkText} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-recent-section">
        <div className="home-section-heading home-recent-heading">
          <div>
            <span className="home-section-eyebrow">
              FROM THE COMMUNITY
            </span>
            <h2>Recent reports</h2>
            <p>
              Take a look at the latest environmental issues shared with EcoMap.
            </p>
          </div>

          <Link to="/map" className="home-view-all">
            View all reports <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="home-loading">Loading recent reports…</div>
        ) : recent.length > 0 ? (
          <div className="home-recent-grid">
            {recent.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="home-empty-state">
            <div className="home-empty-icon">🌿</div>
            <h3>No reports yet</h3>
            <p>
              Be the first to report an environmental issue in your area.
            </p>
            <Link to="/report" className="btn home-primary-btn">
              Submit the first report
            </Link>
          </div>
        )}
      </section>

      <section className="home-cta">
        <div>
          <span className="home-section-eyebrow">
            BE PART OF THE CHANGE
          </span>
          <h2>Your city deserves a greener tomorrow.</h2>
          <p>
            Start with one report. Help make environmental problems visible.
          </p>
        </div>

        <Link to="/report" className="btn home-cta-btn">
          Report an issue <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}
