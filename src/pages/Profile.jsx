import { useState, useEffect } from "react";
import api from "../services/api";

export default function Profile({ currentUser, logout, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    location: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        location: currentUser.location || "",
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      // Use FormData to support image upload
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("location", formData.location);

      if (photoFile) {
        data.append("profile_photo", photoFile);
      }

      await api.patch(`profile/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Fetch fresh profile
      const updatedProfileResponse = await api.get('profile/');
      setUser(updatedProfileResponse.data);

      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setPhotoFile(null);
    } catch (err) {
      console.error("Profile Update Error:", err);
      const errorData = err.response?.data;
      if (errorData) {
        if (typeof errorData === 'object') {
          const errors = Object.keys(errorData).map(key => `${key}: ${errorData[key]}`);
          setMessage("Update Failed: " + errors.join(' | '));
        } else {
          setMessage("Update Failed: " + errorData);
        }
      } else {
        setMessage("Connection Error. Please check your backend.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page container fade-in">
      <header className="profile-header-premium">
        <div className="profile-hero card-3d-raised">
          <div className="profile-hero-content">
            <div className="avatar-wrapper">
              <img
                src={currentUser.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                alt="Profile"
                className="profile-avatar-xl"
                style={{ objectFit: 'cover' }}
              />
              {isEditing && (
                <label className="btn-edit-avatar">
                  📷
                  <input type="file" onChange={handlePhotoChange} style={{ display: 'none' }} accept="image/*" />
                </label>
              )}
            </div>
            <div className="profile-title-group">
              <span className={`role-pill ${currentUser.role}`}>
                {currentUser.role === 'worker' ? 'Professional Worker' : 'Job Poster'}
              </span>
              <h1>{currentUser.username}</h1>
              <p className="profile-subtitle">
                {currentUser.location || "Location not set"} • Joined {new Date(currentUser.joined_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="profile-hero-actions">
            <button className="btn btn-primary" onClick={() => setIsEditing(!isEditing)} disabled={isSubmitting}>
              {isEditing ? "View Profile" : "Edit Profile"}
            </button>
            <button className="btn btn-secondary logout-btn" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </header>

      {message && (
        <div className={`status-badge-premium ${message.includes('Failed') || message.includes('Error') ? 'unverified' : 'verified'}`}
          style={{ marginBottom: '2rem', textAlign: 'center', width: '100%', padding: '1rem' }}>
          {message}
        </div>
      )}

      {photoFile && isEditing && (
        <div className="status-badge-premium verified" style={{ marginBottom: '1rem', textAlign: 'center' }}>
          New photo selected: {photoFile.name} (Save to apply)
        </div>
      )}

      <div className="profile-main-grid">
        <div className="profile-info-column" style={{ gridColumn: 'span 2' }}>
          <section className="card-3d-raised detail-section">
            <div className="section-header">
              <h3>{isEditing ? "Update Information" : "Personal Information"}</h3>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="edit-profile-form">
                <div className="detail-grid">
                  <div className="form-group">
                    <label>Username</label>
                    <input name="username" value={formData.username} onChange={handleChange} className="premium-input" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} className="premium-input" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} className="premium-input" placeholder="+91 ..." />
                  </div>
                  <div className="form-group">
                    <label>Work Location</label>
                    <input name="location" value={formData.location} onChange={handleChange} className="premium-input" placeholder="City, State" />
                  </div>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setIsEditing(false); setPhotoFile(null); }} disabled={isSubmitting}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <p>{currentUser.username}</p>
                </div>
                <div className="detail-item">
                  <label>Email Address</label>
                  <p>{currentUser.email}</p>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{currentUser.phone || "Not provided"}</p>
                </div>
                <div className="detail-item">
                  <label>Work Location</label>
                  <p>{currentUser.location || "Not set"}</p>
                </div>
              </div>
            )}
          </section>

          {!isEditing && (
            <section className="card-3d-raised detail-section mt-4">
              <div className="section-header">
                <h3>Professional Identity</h3>
              </div>
              <div className="bio-container">
                <label>Professional Bio</label>
                <p className="bio-text">
                  {currentUser.role === 'worker'
                    ? "Expert freelancer delivering high-quality results for local and digital gigs."
                    : "Reliable business partner hiring verified professionals for diverse projects."}
                </p>
              </div>
              <div className="skills-row">
                <span className="skill-tag">Professional</span>
                <span className="skill-tag">Verified</span>
                <span className="skill-tag">{currentUser.role === 'worker' ? 'Top Talent' : 'Top Hirer'}</span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
