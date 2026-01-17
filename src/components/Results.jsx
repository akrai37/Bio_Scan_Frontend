import './Results.css'

const Results = ({ results, onReset }) => {
  const getScoreColor = (score) => {
    if (score >= 70) return '#10b981' // Green
    if (score >= 40) return '#f59e0b' // Yellow
    return '#ef4444' // Red
  }

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Good'
    if (score >= 40) return 'Moderate'
    return 'Poor'
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Protocol Analysis Results</h2>
        <button className="reset-button" onClick={onReset}>
          Analyze Another Protocol
        </button>
      </div>

      {/* Success Probability Score */}
      <div className="score-card">
        <div className="score-circle-container">
          <div 
            className="score-circle"
            style={{
              background: `conic-gradient(${getScoreColor(results.success_probability)} ${results.success_probability * 3.6}deg, #e5e7eb 0deg)`
            }}
          >
            <div className="score-inner">
              <span className="score-value">{results.success_probability}%</span>
              <span className="score-label">Success Probability</span>
            </div>
          </div>
        </div>
        <div className="score-details">
          <h3 style={{ color: getScoreColor(results.success_probability) }}>
            {getScoreLabel(results.success_probability)} Protocol
          </h3>
          {results.estimated_cost && results.estimated_cost !== 'Unknown' && (
            <p className="estimate">💰 Estimated Cost: {results.estimated_cost}</p>
          )}
          {results.estimated_time && results.estimated_time !== 'Unknown' && (
            <p className="estimate">⏱️ Estimated Time: {results.estimated_time}</p>
          )}
        </div>
      </div>

      {/* Critical Issues */}
      {results.critical_issues && results.critical_issues.length > 0 && (
        <div className="issues-section critical">
          <h3>
            <span className="icon">🔴</span>
            Critical Issues ({results.critical_issues.length})
          </h3>
          <p className="section-description">These issues will likely cause experiment failure</p>
          <div className="issues-list">
            {results.critical_issues.map((issue, index) => (
              <div key={index} className="issue-card">
                <h4>{issue.issue}</h4>
                <p>{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {results.warnings && results.warnings.length > 0 && (
        <div className="issues-section warnings">
          <h3>
            <span className="icon">🟡</span>
            Warnings ({results.warnings.length})
          </h3>
          <p className="section-description">These should be improved for better results</p>
          <div className="issues-list">
            {results.warnings.map((warning, index) => (
              <div key={index} className="issue-card">
                <h4>{warning.issue}</h4>
                <p>{warning.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passed Checks */}
      {results.passed_checks && results.passed_checks.length > 0 && (
        <div className="issues-section passed">
          <h3>
            <span className="icon">🟢</span>
            Good Practices ({results.passed_checks.length})
          </h3>
          <p className="section-description">These aspects are well-designed</p>
          <div className="issues-list">
            {results.passed_checks.map((check, index) => (
              <div key={index} className="issue-card">
                <h4>{check.check}</h4>
                <p>{check.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {results.suggestions && results.suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3>
            <span className="icon">💡</span>
            Recommendations
          </h3>
          <ul className="suggestions-list">
            {results.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Results
