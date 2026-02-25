import { useState, useEffect } from "react";
import { getDashboard, getApplications, getJobs, deleteJob } from "../services/api";
import NegotiationChat from "../components/NegotiationChat";
import PostJob from "./PostJob";

export default function Dashboard({ currentUser }) {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]); // This will store applications or "my jobs" depending on role
  const [myPostedJobs, setMyPostedJobs] = useState([]);
  const [incomingApplications, setIncomingApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview'); // overview, my-jobs, applications
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [editingJob, setEditingJob] = useState(null); // Job object to be edited

  const fetchData = async () => {
    try {
      console.log('Fetching dashboard data for user:', currentUser?.username);
      const statsData = await getDashboard();
      setStats(statsData);

      if (currentUser?.role === 'worker') {
        const apps = await getApplications();
        console.log('Fetched applications:', apps.length);
        setActivities(apps);
        // ... notifications logic ...
        const newNotifs = apps.map(app => ({
          id: `app-${app.id}`,
          title: app.status === 'approved' ? 'Application Approved!' : 'Status Update',
          message: `Your application for "${app.job_details?.title}" is now ${app.status}.`,
          time: new Date(app.applied_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: app.status
        })).reverse().slice(0, 4);
        setNotifications(newNotifs);

      } else {
        // Fetch Jobs Posted by User
        const allJobs = await getJobs();
        console.log('Fetched all jobs:', allJobs.length);
        const myJobs = allJobs.filter(j => j.poster_name === currentUser?.username);
        console.log('Filtered my jobs:', myJobs.length, 'for username:', currentUser?.username);
        setMyPostedJobs(myJobs);

        // Fetch Applications for my jobs
        const allApps = await getApplications();
        const myJobApps = allApps.filter(app => app.job_details?.poster_name === currentUser?.username);
        console.log('Fetched incoming apps:', myJobApps.length);
        setIncomingApplications(myJobApps);

        // Poster notifications
        const newNotifs = myJobApps.map(app => ({
          id: `poster-app-${app.id}`,
          title: 'New Applicant',
          message: `<strong>${app.worker_name}</strong> applied for: "${app.job_details?.title}"`,
          time: new Date(app.applied_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'new'
        })).reverse().slice(0, 5);
        setNotifications(newNotifs);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    try {
      await deleteJob(jobId);
      alert("Job deleted successfully.");
      fetchData();
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  if (!currentUser) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Please log in to view dashboard.</div>;

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Syncing your real-time dashboard...</p>
    </div>
  );

  const isWorker = currentUser.role === 'worker';

  return (
    <div className="dashboard-page container fade-in">
      <header className="dashboard-header-premium">
        <div className="header-top">
          <div className="title-section">
            <span className="premium-badge">✨ Professional {isWorker ? "Worker" : "Poster"} Portal</span>
            <h1>Dashboard</h1>
            <p className="welcome-msg">Good day, <strong>{currentUser.username}</strong>.</p>
          </div>

          {!isWorker && (
            <div className="dashboard-tabs">
              <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
              <button className={`tab-btn ${activeTab === 'my-jobs' ? 'active' : ''}`} onClick={() => setActiveTab('my-jobs')}>My Jobs ({myPostedJobs.length})</button>
              <button className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>Applications ({incomingApplications.length})</button>
            </div>
          )}
        </div>
      </header>

      {/* Render based on active tab */}
      {activeTab === 'overview' && (
        <div className="stats-grid-premium">
          <div className="stat-card-3d">
            <div className="stat-icon-circle bg-indigo">⭐</div>
            <div className="stat-data">
              <label>Average Rating</label>
              <div className="stat-value">{stats?.avg_rating?.toFixed(1) || "4.8"}</div>
            </div>
          </div>
          <div className="stat-card-3d">
            <div className="stat-icon-circle bg-emerald">
              {isWorker ? "₹" : "🏢"}
            </div>
            <div className="stat-data">
              <label>{isWorker ? "Wallet Balance" : "Active Jobs"}</label>
              <div className="stat-value">
                {isWorker ? `₹${(stats?.total_earned || 0).toLocaleString()}` : (stats?.total_posted || 0)}
              </div>
            </div>
          </div>
          <div className="stat-card-3d">
            <div className="stat-icon-circle bg-amber">
              {isWorker ? "🎯" : "📩"}
            </div>
            <div className="stat-data">
              <label>{isWorker ? "Gigs Completed" : "Pending Apps"}</label>
              <div className="stat-value">
                {isWorker ? (stats?.jobs_done || 0) : (stats?.pending_jobs || 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && isWorker && (
        <div className="card-3d-raised mt-4">
          <div className="card-header">
            <h3>My Applications</h3>
          </div>
          <div className="item-table">
            {activities.map(app => (
              <div key={app.id} className="table-row-premium">
                <div className="item-main">
                  <h4>{app.job_details?.title}</h4>
                  <p>Status: <span className={`status-pill ${app.status}`}>{app.status}</span></p>
                </div>
                <div className="item-meta-info">
                  <span className="price-tag">₹{app.negotiated_wage || app.job_details?.wages}</span>
                  <button className="btn-action" onClick={() => setSelectedApplication(app)}>Chat / Negotiate</button>
                </div>
              </div>
            ))}
            {activities.length === 0 && <p className="text-muted">You haven't applied to any jobs yet.</p>}
          </div>
        </div>
      )}

      {/* MY JOBS TAB (Poster Only) */}
      {!isWorker && activeTab === 'my-jobs' && !editingJob && (
        <div className="card-3d-raised fade-in">
          <div className="card-header">
            <h3>Manage Your Job Listings</h3>
          </div>
          <div className="jobs-list">
            {myPostedJobs.map(job => (
              <div key={job.id} className="job-row-management" style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{job.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{job.category} • Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                  <span className={`status-pill ${job.status}`}>{job.status}</span>
                </div>
                <div className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditingJob(job)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteJob(job.id)} style={{ background: '#ef4444', color: 'white' }}>Delete</button>
                </div>
              </div>
            ))}
            {myPostedJobs.length === 0 && <p className="text-muted" style={{ padding: '2rem' }}>No jobs posted yet.</p>}
          </div>
        </div>
      )}

      {/* Render Edit Job Form when editing */}
      {!isWorker && editingJob && (
        <div className="edit-job-container">
          <PostJob
            editJobData={editingJob}
            isEditMode={true}
            cancelEdit={() => setEditingJob(null)}
            onJobPosted={() => {
              setEditingJob(null);
              fetchData();
            }}
          />
        </div>
      )}

      {/* APPLICATIONS TAB (Poster Only) */}
      {!isWorker && activeTab === 'applications' && (
        <div className="card-3d-raised fade-in">
          <div className="card-header">
            <h3>Incoming Applications</h3>
          </div>
          <div className="item-table">
            {incomingApplications.map(app => (
              <div key={app.id} className="table-row-premium">
                <div className="item-main">
                  <h4>Applicant: {app.worker_name}</h4>
                  <p>For Job: <strong>{app.job_details?.title}</strong></p>
                  <p>Status: <span className={`status-pill ${app.status}`}>{app.status}</span></p>
                </div>
                <div className="item-meta-info">
                  <span className="price-tag">Wage: ₹{app.negotiated_wage || app.job_details?.wages}</span>
                  <button className="btn-action" onClick={() => setSelectedApplication(app)}>Negotiate / Chat</button>
                </div>
              </div>
            ))}
            {incomingApplications.length === 0 && <p className="text-muted" style={{ padding: '1rem' }}>No applications yet.</p>}
          </div>
        </div>
      )}

      {selectedApplication && (
        <NegotiationChat
          application={selectedApplication}
          currentUser={currentUser}
          close={() => setSelectedApplication(null)}
        />
      )}

    </div>
  );
}
