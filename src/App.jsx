import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

import Home from "./pages/Home";
import FindJobs from "./pages/FindJobs";
import PostJob from "./pages/PostJob";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import { getProfile } from "./services/api";

export default function App() {
  const [page, setPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const profile = await getProfile();
          setCurrentUser(profile);
        } catch (err) {
          localStorage.removeItem("access_token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setCurrentUser(null);
    setPage("home");
  };

  const protectedPage = (Component, props = {}) => {
    if (!currentUser) {
      return (
        <div className="center" style={{ flexDirection: 'column', gap: '2rem' }}>
          <div className="card wide text-center">
            <h3>Authentication Required</h3>
            <p>Please sign in to access this feature.</p>
            <button className="btn btn-primary" onClick={() => setShowAuth(true)} style={{ marginTop: '1.5rem' }}>
              Sign In Now
            </button>
          </div>
        </div>
      );
    }
    return <Component currentUser={currentUser} {...props} />;
  };

  const roleProtectedPage = (Component, allowedRole, props = {}) => {
    const authView = protectedPage(Component, props);
    if (currentUser && currentUser.role !== allowedRole) {
      return (
        <div className="center">
          <div className="card text-center">
            <h3>Access Denied</h3>
            <p>Your account type ({currentUser.role}) does not have permission to access this page.</p>
            <button className="btn btn-primary" onClick={() => setPage("dashboard")} style={{ marginTop: '1rem' }}>
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return authView;
  };

  const renderPage = () => {
    switch (page) {
      case "find-jobs": return roleProtectedPage(FindJobs, "worker", { openAuth: () => setShowAuth(true) });
      case "post-job": return roleProtectedPage(PostJob, "poster", { onJobPosted: () => setPage("dashboard") });
      case "dashboard": return protectedPage(Dashboard);
      case "profile": return protectedPage(Profile, { logout, setUser: setCurrentUser });
      default: return <Home navigate={setPage} currentUser={currentUser} openAuth={() => setShowAuth(true)} />;
    }
  };

  if (loading) return <div className="loading-screen">WorkXpress is loading...</div>;

  return (
    <>
      <Header
        navigate={setPage}
        currentUser={currentUser}
        openAuth={() => setShowAuth(true)}
        logout={logout}
      />

      <main className="app-content">
        {renderPage()}
      </main>

      <Footer />

      {showAuth && (
        <AuthModal
          close={() => setShowAuth(false)}
          setUser={setCurrentUser}
        />
      )}
    </>
  );
}

