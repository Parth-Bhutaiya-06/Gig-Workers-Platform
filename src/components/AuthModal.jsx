import { useState } from "react";
import { login, signup, getProfile } from "../services/api";

export default function AuthModal({ close, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "worker",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        // FETCH USER PROFILE HERE
        const profile = await getProfile();
        setUser(profile);
        close();
      } else {
        await signup(formData);
        setIsLogin(true);
        alert("Registration successful! Please login.");
      }
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          // If it's a validation error object, join the messages
          const messages = Object.keys(data).map(key => {
            const val = data[key];
            return Array.isArray(val) ? `${key}: ${val.join(' ')}` : `${key}: ${val}`;
          });
          setError(messages.join(' | '));
        } else {
          setError(data.detail || "Something went wrong. Please check credentials.");
        }
      } else {
        console.error("Auth Error:", err);
        setError(`Connection failed: ${err.message}. Ensure the backend is running on port 8000.`);
      }
    }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.className.includes('modal-overlay') && close()}>
      <div className="modal-content auth-modal">
        <button className="modal-close" onClick={close}>×</button>
        <h2 className="modal-title">{isLogin ? "Welcome Back" : "Create Account"}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              required
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>I am a:</label>
                <div className="role-selector">
                  <label className={`role-option ${formData.role === 'worker' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="worker"
                      checked={formData.role === 'worker'}
                      onChange={handleChange}
                    />
                    Worker
                  </label>
                  <label className={`role-option ${formData.role === 'poster' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="poster"
                      checked={formData.role === 'poster'}
                      onChange={handleChange}
                    />
                    Job Poster
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button className="btn btn-primary btn-full auth-btn">
            {isLogin ? "Sign In" : "Register Now"}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
}
