import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { currentUser, setSession } from "@/lib/store";

export function AppShell() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = currentUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const signOut = () => {
    setSession(null);
    navigate("/");
  };

  return (
    <>
      <header className={`topbar${scrolled ? " scrolled" : ""}`}>
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Blesspoke home">
            <span>
              Bless<b>poke</b>
            </span>
            <span className="brand-sub">by Dennis Lau</span>
          </Link>
          <nav className="topnav" aria-label="Primary">
            <NavLink to="/#how">How it works</NavLink>
            <NavLink to="/#packages">Packages</NavLink>
            <NavLink to="/#dennis">Dennis</NavLink>
            {user?.role === "creator" && <NavLink to="/studio">Studio</NavLink>}
            {user?.role === "admin" && <NavLink to="/lumo">Lumo</NavLink>}
            {user ? (
              <>
                <NavLink to="/dashboard">My songs</NavLink>
                <button className="btn btn-ghost btn-sm" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Sign in</NavLink>
                <Link to="/brief" className="btn btn-gold btn-sm">
                  Create your song
                </Link>
              </>
            )}
          </nav>
          <button
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile">
          <Link to="/">Home</Link>
          <Link to="/#how">How it works</Link>
          <Link to="/#packages">Packages</Link>
          <Link to="/#dennis">Dennis</Link>
          {user?.role === "creator" && <Link to="/studio">Studio</Link>}
          {user?.role === "admin" && <Link to="/lumo">Lumo</Link>}
          {user ? (
            <>
              <Link to="/dashboard">My songs</Link>
              <Link to="/brief">Create your song</Link>
              <button className="btn btn-ghost" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/brief" className="btn btn-gold" style={{ marginTop: 14 }}>
                Create your song
              </Link>
            </>
          )}
        </nav>
      )}

      <main>
        <Outlet />
      </main>
    </>
  );
}
