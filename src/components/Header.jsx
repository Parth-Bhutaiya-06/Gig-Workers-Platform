import Navbar from "./Navbar";

export default function Header({ navigate, currentUser, openAuth, logout }) {
  return (
    <header className="main-header">
      <div className="container nav-flex">
        <div className="logo" onClick={() => navigate("home")}>
          <span className="logo-text">Work<span>Xpress</span></span>
        </div>

        <Navbar currentUser={currentUser} logout={logout} navigate={navigate} />
      </div>
    </header>
  );
}
