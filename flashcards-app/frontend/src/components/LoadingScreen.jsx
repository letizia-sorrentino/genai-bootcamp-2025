import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p className="loading-text">Generating flashcards...</p>
        <p className="loading-subtext">This may take a few moments</p>
      </div>
    </div>
  );
};

export default LoadingScreen; 