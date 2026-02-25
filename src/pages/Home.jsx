export default function Home({ navigate, currentUser, openAuth }) {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="badge-container">
              <span className="premium-badge">✨ India's Trusted Gig Ecosystem</span>
            </div>
            <h1 className="hero-title">
              Turn Your <span className="gradient-text">Skills</span> Into <span className="gradient-text">Earnings</span>
            </h1>
            <p className="hero-subtitle">
              The first location-aware platform for fair negotiations and reliable gig work.
              Join 50,000+ Indians finding work every day.
            </p>

            {!currentUser ? (
              <div className="hero-auth-prompt card">
                <h3>Welcome to WorkXpress</h3>
                <p>Join our community to browse local jobs and post opportunities.</p>
                <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
                  <button className="btn btn-primary btn-lg" onClick={openAuth}>
                    Sign In to Enter
                  </button>
                  <button className="btn btn-secondary btn-lg" onClick={openAuth}>
                    Create Free Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="hero-actions">
                {currentUser.role === 'worker' ? (
                  <button className="btn btn-primary btn-lg" onClick={() => navigate("find-jobs")}>
                    Find Work Nearby
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-lg" onClick={() => navigate("post-job")}>
                    Post a Vacancy
                  </button>
                )}
              </div>
            )}

            <div className="hero-secondary-actions" style={{ marginTop: '2.5rem' }}>
              <button className="btn btn-ghost" onClick={() => currentUser ? navigate("find-jobs") : openAuth()}>
                Browse All Opportunities →
              </button>
            </div>
          </div>
        </div>
      </section>

      {currentUser && (
        <section className="features-section container">
          <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>Why <span className="text-primary">WorkXpress</span>?</h2>
            <p className="text-muted">Built for the modern Indian economy.</p>
          </div>
          <div className="stats-grid">
            <div className="card feature-card">
              <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
              <h3>Location Aware</h3>
              <p className="text-muted">Find jobs within 5km of your current location instantly.</p>
            </div>
            <div className="card feature-card">
              <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
              <h3>Fair Negotiation</h3>
              <p className="text-muted">Chat directly with posters to agree on a price that works for both.</p>
            </div>
            <div className="card feature-card">
              <div className="icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3>Instant Pay</h3>
              <p className="text-muted">Get paid immediately upon confirmation of work completion.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
