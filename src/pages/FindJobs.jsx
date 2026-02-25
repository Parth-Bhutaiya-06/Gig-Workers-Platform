import { useState, useEffect } from "react";
import { getJobs, applyJob } from "../services/api";

export default function FindJobs({ currentUser, openAuth }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    urgency: "",
  });

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs({
        search: filters.search,
        category: filters.category,
        urgency: filters.urgency
      });
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!currentUser) return openAuth();
    if (currentUser.role !== 'worker') {
      return alert("Only workers can apply for jobs.");
    }
    try {
      await applyJob(jobId);
      alert("Application sent! The poster has been notified via email.");
      fetchJobs(); // Refresh list to remove applied job if intended
    } catch (err) {
      alert(err.response?.data?.detail || "You have already applied for this job.");
    }
  };

  return (
    <div className="find-jobs-page container">
      <aside className="filters-sidebar">
        <div className="filter-header">
          <h3>Filter Gigs</h3>
          <button
            className="btn-reset"
            onClick={() => setFilters({ search: "", category: "", urgency: "" })}
          >
            Reset
          </button>
        </div>

        <div className="filter-section">
          <label>🔍 Search Jobs</label>
          <div className="filter-input-wrapper">
            <input
              type="text"
              placeholder="Title, skills, or company..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <div className="filter-section">
          <label>📁 Business Category</label>
          <div className="filter-pills">
            {["", "General Work", "Technical Service", "Creative Design", "Heavy Loading", "Home Maintenance", "Delivery"].map(cat => (
              <button
                key={cat}
                className={`filter-pill ${filters.category === cat ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, category: cat })}
              >
                {cat || "All Categories"}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label>⚡ Priority Level</label>
          <div className="filter-pills">
            {[
              { label: "All", value: "" },
              { label: "Regular", value: "regular" },
              { label: "Urgent", value: "urgent" }
            ].map(prio => (
              <button
                key={prio.value}
                className={`filter-pill ${filters.urgency === prio.value ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, urgency: prio.value })}
              >
                {prio.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="jobs-main">
        <div className="jobs-header">
          <h2>Browse <span className="gradient-text">Opportunities</span></h2>
          <p>{jobs.length} jobs found nearby</p>
        </div>

        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-detailed-card card-3d">
                <div className="job-image-container">
                  {job.photo ? (
                    <img src={job.photo} alt={job.title} className="job-image" />
                  ) : (
                    <div className="job-image-placeholder">
                      <span>{job.category?.charAt(0) || 'G'}</span>
                    </div>
                  )}
                  <div className="job-tags-overlay">
                    <span className={`urgency-badge ${job.urgency}`}>
                      {job.urgency === 'urgent' ? '🔥 Urgent' : '🕒 Regular'}
                    </span>
                  </div>
                </div>

                <div className="job-body">
                  <div className="job-category-tag">{job.category}</div>
                  <h3 className="job-title-premium">{job.title}</h3>
                  <p className="job-description-premium">{job.description.substring(0, 120)}...</p>

                  <div className="job-info-row">
                    <div className="info-stat">
                      <span className="stat-label">💰 Compensation</span>
                      <span className="stat-value highlight">₹{job.wages}</span>
                    </div>
                    <div className="info-stat">
                      <span className="stat-label">📍 Location</span>
                      <span className="stat-value">{job.location}</span>
                    </div>
                  </div>

                  <div className="job-footer-meta">
                    <div className="poster-info">
                      <div className="poster-avatar">
                        {job.poster_name?.charAt(0)}
                      </div>
                      <div className="poster-details">
                        <span className="poster-name">{job.poster_name}</span>
                        <span className="post-date">Posted on {new Date(job.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary apply-btn-premium"
                      onClick={() => handleApply(job.id)}
                    >
                      View & Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {jobs.length === 0 && <p className="empty-state">No jobs matching your criteria.</p>}
          </div>
        )}
      </main>
    </div>
  );
}
