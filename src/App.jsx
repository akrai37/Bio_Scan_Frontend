import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import FileUpload from './components/FileUpload'
import Results from './components/Results'
import Header from './components/Header'
import SkeletonLoader from './components/SkeletonLoader'
import './App.css'

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [protocolText, setProtocolText] = useState('')

  const handleAnalysisComplete = (data) => {
    setResults(data)
    setLoading(false)
    setError(null)
    setProtocolText(data.protocol_text || '')
    
    // Trigger confetti for high scores
    if (data.success_probability >= 85) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#667eea', '#764ba2', '#10b981']
        })
      }, 500)
    }
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
    setUploadedFile(null)
    setProtocolText('')
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
            onFileSelected={setUploadedFile}
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
            <SkeletonLoader />
          )}

          {results && (
            <Results 
              results={results} 
              onReset={handleReset}
              uploadedFile={uploadedFile}
              protocolText={protocolText}
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
