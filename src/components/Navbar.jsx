import { useState, useEffect } from "react";

export default function Navbar({ currentUser, logout, navigate }) {
  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    fetch("/data/navbar.xml")
      .then((response) => response.text())
      .then((xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");
        const parsedItems = Array.from(items).map((item) => ({
          label: item.getElementsByTagName("label")[0].textContent,
          path: item.getElementsByTagName("path")[0].textContent,
        }));
        setNavItems(parsedItems);
      })
      .catch((err) => console.error("Error loading XML navbar:", err));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("home");
  };

  const handleNavClick = (path) => {
    // Map "/" to "home" and "/dashboard" to "dashboard"
    const page = path === "/" ? "home" : path.replace("/", "");
    navigate(page);
  };

  return (
    <nav className="header-nav">
      <div className="nav-links">
        {navItems.map((item, index) => (
          <a key={index} onClick={() => handleNavClick(item.path)} className="nav-link">
            {item.label}
          </a>
        ))}
      </div>

      <div className="nav-auth">
        {currentUser ? (
          <div className="user-nav-box">
            <span className="user-welcome">Hi, {currentUser.username}</span>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', marginLeft: '1rem' }}>Logout</button>
          </div>
        ) : (
          <button onClick={() => navigate("home")} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Get Started</button>
        )}
      </div>
    </nav>
  );
}
