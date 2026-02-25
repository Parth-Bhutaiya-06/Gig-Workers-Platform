import { useState, useEffect } from "react";
import { postJob, updateJob } from "../services/api";

export default function PostJob({ onJobPosted, editJobData = null, isEditMode = false, cancelEdit }) {
  const [step, setStep] = useState(1);
  const [isTracing, setIsTracing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "General Work",
    location: "",
    latitude: "",
    longitude: "",
    start_date: "",
    due_date: "",
    description: "",
    wages: "",
    urgency: "regular",
    is_digital: false,
    photo: null, // Note: File inputs can't be pre-filled securely in browsers usually, so we handle this carefully
  });

  useEffect(() => {
    if (isEditMode && editJobData) {
      setFormData({
        title: editJobData.title || "",
        category: editJobData.category || "General Work",
        location: editJobData.location || "",
        latitude: editJobData.latitude || "",
        longitude: editJobData.longitude || "",
        start_date: editJobData.start_date || "",
        due_date: editJobData.due_date || "",
        description: editJobData.description || "",
        wages: editJobData.wages || "",
        urgency: editJobData.urgency || "regular",
        is_digital: editJobData.is_digital || false,
        photo: null // We don't pre-fill file object
      });
    }
  }, [isEditMode, editJobData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const traceLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsTracing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          location: `Pinned: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        });
        setIsTracing(false);
      },
      (error) => {
        alert("Unable to retrieve your location. Please enter it manually.");
        setIsTracing(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });

      if (isEditMode) {
        // For Update, we might not send photo if not changed, but generic FormData handles it safely usually if null/undefined is filtered
        await updateJob(editJobData.id, data);
        alert("Job updated successfully!");
        if (onJobPosted) onJobPosted(); // acts as onComplete
      } else {
        await postJob(data);
        alert("Success! Your opportunity is now live.");
        if (onJobPosted) onJobPosted();
      }
    } catch (err) {
      alert((isEditMode ? "Update" : "Post") + " failed: " + (err.response?.data?.detail || "Please check all fields"));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step fade-in">
            <div className="form-section-title">
              <span className="step-num">01</span>
              <h3>Core Details</h3>
            </div>
            <div className="form-group">
              <label>What needs to be done?</label>
              <input name="title" required placeholder="e.g. Electrical Repair or Web Design" value={formData.title} onChange={handleChange} className="premium-input" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="premium-input">
                  <option>General Work</option>
                  <option>Technical Service</option>
                  <option>Creative Design</option>
                  <option>Heavy Loading</option>
                  <option>Home Maintenance</option>
                  <option>Delivery</option>
                </select>
              </div>
              <div className="form-group">
                <label>Budget (INR)</label>
                <input name="wages" type="number" required placeholder="₹ 0.00" value={formData.wages} onChange={handleChange} className="premium-input" />
              </div>
            </div>
            <button type="button" className="btn btn-primary btn-next" onClick={() => setStep(2)}>Next: Location & Dates →</button>
            {isEditMode && <button type="button" className="btn btn-ghost" onClick={cancelEdit} style={{ marginTop: '1rem' }}>Cancel Edit</button>}
          </div>
        );
      case 2:
        return (
          <div className="form-step fade-in">
            <div className="form-section-title">
              <span className="step-num">02</span>
              <h3>Location & Timing</h3>
            </div>
            <div className="form-group">
              <label>Work Location</label>
              <div className="location-input-wrapper">
                <input name="location" required placeholder="Street, City or Trace" value={formData.location} onChange={handleChange} className="premium-input" />
                <button type="button" className={`btn-trace ${isTracing ? 'tracing' : ''}`} onClick={traceLocation}>
                  {isTracing ? "..." : "📍 Trace"}
                </button>
              </div>
              {formData.latitude && <p className="coords-display">Precision: Lat {formData.latitude}, Lng {formData.longitude}</p>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start From</label>
                <input name="start_date" type="date" required value={formData.start_date} onChange={handleChange} className="premium-input" />
              </div>
              <div className="form-group">
                <label>Complete By</label>
                <input name="due_date" type="date" required value={formData.due_date} onChange={handleChange} className="premium-input" />
              </div>
            </div>
            <div className="step-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="btn btn-primary btn-next" onClick={() => setStep(3)}>Next: Finalizing →</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-step fade-in">
            <div className="form-section-title">
              <span className="step-num">03</span>
              <h3>Finalize Posting</h3>
            </div>
            <div className="form-group">
              <label>Explanatory Description</label>
              <textarea name="description" required placeholder="Mention specific requirements, tools needed, etc." value={formData.description} onChange={handleChange} className="premium-input tall" />
            </div>
            <div className="form-row">
              <div className="form-group checkbox-premium">
                <label>
                  <input name="is_digital" type="checkbox" checked={formData.is_digital} onChange={handleChange} />
                  <span>This is a remote/digital job</span>
                </label>
              </div>
              <div className="form-group">
                <label>Urgency Level</label>
                <div className="urgency-toggle">
                  <button type="button" className={`toggle-btn ${formData.urgency === 'regular' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, urgency: 'regular' })}>Regular</button>
                  <button type="button" className={`toggle-btn ${formData.urgency === 'urgent' ? 'active' : ''}`} onClick={() => setFormData({ ...formData, urgency: 'urgent' })}>Urgent</button>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Reference Image (Recommended)</label>
              <div className="file-drop-zone">
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <p>{formData.photo ? formData.photo.name : "Click to upload an image of the workplace"}</p>
                {isEditMode && !formData.photo && <p className="text-muted small">(Leave empty to keep existing)</p>}
              </div>
            </div>
            <div className="step-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button type="submit" className="btn btn-emerald btn-lg">{isEditMode ? "Save Changes" : "Publish Opportunity Now"}</button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="post-job-page container">
      <div className="form-container-premium">
        <aside className="post-sidebar">
          <div className="logo-small">Work<span>Xpress</span></div>
          <div className="step-indicator">
            <div className={`step-item ${step >= 1 ? 'active' : ''} ${step === 1 ? 'current' : ''}`}>Details</div>
            <div className={`step-item ${step >= 2 ? 'active' : ''} ${step === 2 ? 'current' : ''}`}>Location</div>
            <div className={`step-item ${step >= 3 ? 'active' : ''} ${step === 3 ? 'current' : ''}`}>Finalize</div>
          </div>
          <div className="sidebar-hint card">
            <h4>{isEditMode ? "Editing Mode" : "Pro Tip"}</h4>
            <p>{isEditMode ? "Update only the fields you need to change." : "Precise location tracing helps you find workers within minutes, not hours."}</p>
          </div>
        </aside>

        <main className="form-main">
          <header className="form-header-main">
            <h2>{isEditMode ? "Edit Job Listing" : (step === 3 ? "Ready to publish?" : "Find the right talent")}</h2>
            <p>{isEditMode ? "Modify details for your job posting." : "Your job will reach verified professionals in your proximity."}</p>
          </header>

          <form onSubmit={handleSubmit} className="premium-stepper-form">
            {renderStep()}
          </form>
        </main>
      </div>
    </div>
  );
}
