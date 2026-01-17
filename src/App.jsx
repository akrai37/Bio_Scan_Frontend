import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Results from './components/Results'
import Header from './components/Header'
import './App.css'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalysisComplete = (data) => {
    setResults(data)
    setLoading(false)
    setError(null)
  }

  const handleAnalysisStart = () => {
    setLoading(true)
    setError(null)
    setResults(null)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setLoading(false)
    setResults(null)
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
    setLoading(false)
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="container">
          {!results && !loading && (
            <div className="hero">
              <h2>Validate Your Protocol Before You Start</h2>
              <p className="subtitle">
                Upload your experimental protocol and get instant AI-powered analysis.
                Catch critical issues before they cost you time and money.
              </p>
            </div>
          )}

          <FileUpload 
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisStart={handleAnalysisStart}
            onError={handleError}
          />

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <h3>Analysis Failed</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing your protocol...</p>
              <span className="loading-subtext">This may take 10-15 seconds</span>
            </div>
          )}

          {results && (
            <Results 
              results={results} 
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <p>BioScan - Built for Disrupt Bio Hackathon 2026</p>
      </footer>
    </div>
  )
}

export default App
