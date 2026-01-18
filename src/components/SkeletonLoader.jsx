import './SkeletonLoader.css'

const SkeletonLoader = () => {
  return (
    <div className="skeleton-container">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-button"></div>
      </div>

      <div className="skeleton-score-card">
        <div className="skeleton-circle"></div>
        <div className="skeleton-details">
          <div className="skeleton-line long"></div>
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line medium"></div>
        </div>
      </div>

      <div className="skeleton-section">
        <div className="skeleton-section-header"></div>
        <div className="skeleton-card">
          <div className="skeleton-line long"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line long"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line long"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>

      <div className="skeleton-section">
        <div className="skeleton-section-header"></div>
        <div className="skeleton-card">
          <div className="skeleton-line long"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line long"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>

      <div className="analyzing-text">
        <div className="dna-loader">
          <div className="strand"></div>
          <div className="strand"></div>
        </div>
        <p>Analyzing protocol with AI...</p>
      </div>
    </div>
  )
}

export default SkeletonLoader
