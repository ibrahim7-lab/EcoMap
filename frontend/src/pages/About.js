export default function About() {
  const features = [
    {
      number: '01',
      icon: '⌖',
      title: 'Interactive Environmental Map',
      description:
        'Explore reported environmental issues geographically and understand where problems are occurring in your community.',
    },
    {
      number: '02',
      icon: '◎',
      title: 'Community Reporting',
      description:
        'Submit environmental reports with descriptions, photographs, categories, and precise map locations.',
    },
    {
      number: '03',
      icon: '↗',
      title: 'Track Report Progress',
      description:
        'View submitted reports and follow their status as they move through the review process.',
    },
    {
      number: '04',
      icon: '▥',
      title: 'Environmental Insights',
      description:
        'Use report statistics and hotspot information to identify areas that may need greater attention.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Spot an issue',
      description:
        'Notice garbage dumping, water leakage, pollution, or damage to trees in your neighbourhood.',
    },
    {
      number: '02',
      title: 'Submit a report',
      description:
        'Add a description, choose a category, pin the location, and optionally upload a photograph.',
    },
    {
      number: '03',
      title: 'Review and track',
      description:
        'The report begins as Pending Review and can be tracked as its status is updated by an administrator.',
    },
  ];

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">
            <span className="about-eyebrow-dot" />
            ABOUT EC0MAP
          </span>

          <h1>
            A cleaner planet
            <br />
            starts <span>with us.</span>
          </h1>

          <p>
            EcoMap is a community-focused environmental reporting
            platform that helps people document local environmental
            issues, explore them on a map, and build awareness
            about the places that need attention.
          </p>

          <div className="about-hero-actions">
            <a href="/report" className="about-primary-button">
              Report an issue <span>→</span>
            </a>

            <a href="/map" className="about-secondary-button">
              Explore the map
            </a>
          </div>

          <div className="about-hero-note">
            <span>✳</span>
            Small actions. Stronger communities. A greener future.
          </div>
        </div>

        <div className="about-hero-visual">
          <div className="about-visual-orbit about-visual-orbit-one" />
          <div className="about-visual-orbit about-visual-orbit-two" />

          <div className="about-earth">
            <div className="about-earth-symbol">♧</div>
            <span>OUR PLANET</span>
            <strong>Our shared home.</strong>
          </div>

          <div className="about-floating-card about-floating-card-top">
            <span className="about-floating-icon">⌖</span>
            <div>
              <strong>Observe</strong>
              <small>Identify local issues</small>
            </div>
          </div>

          <div className="about-floating-card about-floating-card-bottom">
            <span className="about-floating-icon">✓</span>
            <div>
              <strong>Take action</strong>
              <small>Make your voice count</small>
            </div>
          </div>

          <span className="about-decorative-leaf about-leaf-one">✳</span>
          <span className="about-decorative-leaf about-leaf-two">✦</span>
        </div>
      </section>

      <section className="about-mission-section">
        <div className="about-section-intro">
          <span className="about-section-label">WHY EC0MAP EXISTS</span>
          <h2>
            Making environmental issues
            <br />
            <span>easier to see.</span>
          </h2>
          <p>
            Environmental problems can go unnoticed when people
            lack an easy way to document and understand them.
            EcoMap aims to make local reporting and awareness
            more accessible.
          </p>
        </div>

        <div className="about-mission-grid">
          <article className="about-mission-card about-mission-card-primary">
            <span className="about-card-icon">◎</span>
            <span className="about-card-label">OUR MISSION</span>
            <h3>Turn awareness into action.</h3>
            <p>
              Give community members a straightforward way to
              document environmental issues and see where
              attention may be needed.
            </p>
          </article>

          <article className="about-mission-card">
            <span className="about-card-icon">♧</span>
            <span className="about-card-label">OUR VISION</span>
            <h3>Communities that care for their surroundings.</h3>
            <p>
              Encourage environmental awareness through shared
              information, location-based reporting, and
              community participation.
            </p>
          </article>
        </div>
      </section>

      <section className="about-features-section">
        <div className="about-section-heading">
          <div>
            <span className="about-section-label">WHAT YOU CAN DO</span>
            <h2>One platform. Multiple ways to help.</h2>
          </div>

          <p>
            Explore the tools designed to make local environmental
            reporting easier to understand and use.
          </p>
        </div>

        <div className="about-features-grid">
          {features.map((feature) => (
            <article className="about-feature-card" key={feature.number}>
              <div className="about-feature-top">
                <span className="about-feature-icon">{feature.icon}</span>
                <span className="about-feature-number">
                  {feature.number}
                </span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="about-feature-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="about-process-section">
        <div className="about-process-heading">
          <span className="about-section-label">HOW IT WORKS</span>
          <h2>From observation to awareness.</h2>
          <p>
            Three simple steps help you document an environmental
            issue and follow its progress within EcoMap.
          </p>
        </div>

        <div className="about-process-grid">
          {steps.map((step, index) => (
            <article className="about-process-card" key={step.number}>
              <div className="about-process-number">{step.number}</div>

              {index < steps.length - 1 && (
                <div className="about-process-connector" />
              )}

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-disclaimer-section">
        <div className="about-disclaimer-icon">i</div>

        <div>
          <h2>Transparency matters</h2>
          <p>
            EcoMap is an environmental reporting and awareness
            prototype. It does not automatically send complaints
            to municipal authorities and does not replace official
            reporting channels. New reports are marked
            <strong> Pending Review </strong>
            until an administrator checks them. For urgent issues,
            please use the appropriate official reporting service.
          </p>
        </div>
      </section>

      <section className="about-cta-section">
        <div className="about-cta-decoration">♧</div>

        <div className="about-cta-content">
          <span className="about-section-label">YOUR COMMUNITY NEEDS YOU</span>
          <h2>
            Notice a problem?
            <br />
            Be part of the solution.
          </h2>
          <p>
            Help build awareness of environmental issues in
            your neighbourhood, one report at a time.
          </p>

          <div className="about-hero-actions">
            <a href="/report" className="about-cta-button">
              Submit a report <span>→</span>
            </a>

            <a href="/map" className="about-cta-link">
              Explore EcoMap
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}