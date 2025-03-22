import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/NavBar.css';

const NavBar = ({ onHomeClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={handleHomeClick}
        aria-label="Home"
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </button>
      <button
        className={`nav-item ${isActive('/favorites') ? 'active' : ''}`}
        onClick={() => navigate('/favorites')}
        aria-label="Favorites"
      >
        <span className="nav-icon">⭐</span>
        <span className="nav-label">Favorites</span>
      </button>
    </nav>
  );
};

export default NavBar;
