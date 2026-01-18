import { jsPDF } from 'jspdf'
import { useState } from 'react'
import PDFViewer from './PDFViewer'
import './Results.css'

const Results = ({ results, onReset, uploadedFile, protocolText }) => {
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(null)
  const [highlightMatches, setHighlightMatches] = useState([])
  const [expandedFixes, setExpandedFixes] = useState({})
  const [generatedFixes, setGeneratedFixes] = useState({})
  const [loadingFixes, setLoadingFixes] = useState({})
  const [selectedFixes, setSelectedFixes] = useState({})
  const [generatingProtocol, setGeneratingProtocol] = useState(false)
  const [improvedProtocol, setImprovedProtocol] = useState(null)
  const [shoppingList, setShoppingList] = useState(null)
  const [loadingShoppingList, setLoadingShoppingList] = useState(false)
  
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

  // Generate fix for a specific issue
  const generateFix = async (issueKey, issue, description) => {
    setLoadingFixes(prev => ({ ...prev, [issueKey]: true }))
    
    try {
      const response = await fetch('http://localhost:8000/api/generate-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue: issue,
          description: description,
          protocol_context: results.raw_analysis || ''
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate fix')
      
      const fix = await response.json()
      setGeneratedFixes(prev => ({ ...prev, [issueKey]: fix }))
      setExpandedFixes(prev => ({ ...prev, [issueKey]: true }))
      
    } catch (error) {
      console.error('Error generating fix:', error)
      alert('Failed to generate fix. Please try again.')
    } finally {
      setLoadingFixes(prev => ({ ...prev, [issueKey]: false }))
    }
  }

  // Toggle fix selection
  const toggleFixSelection = (issueKey) => {
    setSelectedFixes(prev => ({
      ...prev,
      [issueKey]: !prev[issueKey]
    }))
  }

  // Format protocol text with better styling
  const formatProtocol = (text) => {
    if (!text) return ''
    
    return text
      // Bold section headers (lines ending with :)
      .replace(/^([A-Z][^:\n]{2,50}):$/gm, '<strong class="protocol-heading">$1:</strong>')
      // Bold numbered steps
      .replace(/^(\d+\.\s)/gm, '<strong class="protocol-step">$1</strong>')
      // Highlight temperatures (more specific - with degree symbol or word)
      .replace(/\b(\d+\s*°C)\b/g, '<span class="protocol-temp">$1</span>')
      .replace(/\b(\d+\s*degrees\s+(?:C|Celsius))\b/gi, '<span class="protocol-temp">$1</span>')
      // Highlight concentrations (more specific patterns)
      .replace(/\b(\d+\.?\d*\s*(?:mg|ml|μl|µl|ul)(?:\/(?:mg|ml|μl|µl|ul))?)\b/gi, '<span class="protocol-conc">$1</span>')
      .replace(/\b(\d+\.?\d*\s*[μµu]?M)\b/g, '<span class="protocol-conc">$1</span>')
      .replace(/\b(\d+\.?\d*\s*(?:mM|nM))\b/g, '<span class="protocol-conc">$1</span>')
      .replace(/\b(\d+\.?\d*\s*%)\b/g, '<span class="protocol-conc">$1</span>')
      // Highlight time durations (more specific)
      .replace(/\b(\d+(?:\.\d+)?\s*(?:minutes?|min|hours?|hr|h|seconds?|sec|s|days?))\b/gi, '<span class="protocol-time">$1</span>')
      // Highlight controls
      .replace(/\b(negative control|positive control|control group|control sample)s?\b/gi, '<span class="protocol-control">$1</span>')
      // Convert line breaks to <br> for HTML rendering
      .replace(/\n/g, '<br/>')
  }

  // Generate improved protocol with all selected fixes
  const generateImprovedProtocol = async () => {
    const fixesToApply = []
    
    // Collect all selected fixes
    Object.keys(selectedFixes).forEach(key => {
      if (selectedFixes[key] && generatedFixes[key]) {
        const [type, indexStr] = key.split('-')
        const index = parseInt(indexStr)
        
        const issue = type === 'critical' 
          ? results.critical_issues[index]
          : results.warnings[index]
        
        fixesToApply.push({
          issue: issue.issue,
          description: issue.description,
          fix_suggestion: generatedFixes[key].fix_suggestion,
          implementation_steps: generatedFixes[key].implementation_steps
        })
      }
    })
    
    if (fixesToApply.length === 0) {
      alert('Please select at least one fix to apply')
      return
    }
    
    setGeneratingProtocol(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/generate-improved-protocol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_protocol: protocolText,
          fixes_to_apply: fixesToApply
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate improved protocol')
      
      const improved = await response.json()
      setImprovedProtocol(improved)
      
      // Scroll to improved protocol section
      setTimeout(() => {
        document.getElementById('improved-protocol-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
      
    } catch (error) {
      console.error('Error generating improved protocol:', error)
      alert('Failed to generate improved protocol. Please try again.')
    } finally {
      setGeneratingProtocol(false)
    }
  }

  // Generate shopping list from improved protocol
  const generateShoppingList = async () => {
    if (!improvedProtocol) return
    
    setLoadingShoppingList(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/extract-reagents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protocol_text: improvedProtocol.improved_protocol
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate shopping list')
      
      const shopping = await response.json()
      setShoppingList(shopping)
      
      // Scroll to shopping list section
      setTimeout(() => {
        document.getElementById('shopping-list-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 100)
      
    } catch (error) {
      console.error('Error generating shopping list:', error)
      alert('Failed to generate shopping list. Please try again.')
    } finally {
      setLoadingShoppingList(false)
    }
  }

  // Download improved protocol
  const downloadImprovedProtocol = () => {
    if (!improvedProtocol) return
    
    const blob = new Blob([improvedProtocol.improved_protocol], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'improved-protocol.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Extract highlights from issues for PDF viewer
  const getHighlights = () => {
    const highlights = []
    
    if (results.critical_issues) {
      results.critical_issues.forEach(issue => {
        // Extract key phrases from the issue text
        const keyPhrases = extractKeyPhrases(issue.issue)
        highlights.push({
          text: issue.issue,
          severity: 'critical',
          keywords: keyPhrases
        })
      })
    }
    
    if (results.warnings) {
      results.warnings.forEach(warning => {
        const keyPhrases = extractKeyPhrases(warning.issue)
        highlights.push({
          text: warning.issue,
          severity: 'warning',
          keywords: keyPhrases
        })
      })
    }
    
    return highlights
  }

  // Extract meaningful key phrases from issue descriptions
  const extractKeyPhrases = (text) => {
    // Look for specific technical terms, measurements, procedures
    const phrases = []
    
    // Extract quoted text
    const quotes = text.match(/"([^"]+)"/g)
    if (quotes) {
      quotes.forEach(q => phrases.push(q.replace(/"/g, '')))
    }
    
    // Extract numbers with units (e.g., "450nm", "30 minutes", "2mg/ml")
    const measurements = text.match(/\d+\s*(?:nm|min|minutes|hours|mg|ml|μl|°C|C|M|mM|µM)/gi)
    if (measurements) {
      measurements.forEach(m => phrases.push(m))
    }
    
    // Extract key technical terms (common in protocols)
    const technicalTerms = [
      'incubation', 'centrifuge', 'vortex', 'pipette', 'wash', 'buffer',
      'temperature', 'concentration', 'volume', 'dilution', 'reagent',
      'substrate', 'antibody', 'enzyme', 'plate', 'well', 'sample',
      'standard', 'control', 'blank', 'calibration', 'wavelength'
    ]
    
    const lowerText = text.toLowerCase()
    technicalTerms.forEach(term => {
      if (lowerText.includes(term)) {
        phrases.push(term)
      }
    })
    
    return [...new Set(phrases)] // Remove duplicates
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(102, 126, 234)
    doc.text('BioScan Protocol Analysis Report', 20, 20)
    
    // Date
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28)
    
    // Success Score
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text(`Success Probability: ${results.success_probability}%`, 20, 45)
    doc.setFontSize(12)
    doc.text(`Assessment: ${getScoreLabel(results.success_probability)} Protocol`, 20, 53)
    
    let yPos = 65
    
    // Critical Issues
    if (results.critical_issues && results.critical_issues.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(239, 68, 68)
      doc.text(`Critical Issues (${results.critical_issues.length})`, 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      results.critical_issues.forEach((issue, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}. ${issue.issue}: ${issue.description}`, 170)
        doc.text(lines, 20, yPos)
        yPos += lines.length * 5 + 3
      })
      yPos += 5
    }
    
    // Warnings
    if (results.warnings && results.warnings.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(14)
      doc.setTextColor(245, 158, 11)
      doc.text(`Warnings (${results.warnings.length})`, 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      results.warnings.forEach((warning, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}. ${warning.issue}: ${warning.description}`, 170)
        doc.text(lines, 20, yPos)
        yPos += lines.length * 5 + 3
      })
      yPos += 5
    }
    
    // Good Practices
    if (results.passed_checks && results.passed_checks.length > 0) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(14)
      doc.setTextColor(16, 185, 129)
      doc.text(`Good Practices (${results.passed_checks.length})`, 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      results.passed_checks.forEach((check, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}. ${check.issue}: ${check.description}`, 170)
        doc.text(lines, 20, yPos)
        yPos += lines.length * 5 + 3
      })
      yPos += 5
    }
    
    // Recommendations
    if (results.suggestions && results.suggestions.length > 0) {
      if (yPos > 240) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(14)
      doc.setTextColor(102, 126, 234)
      doc.text('Recommendations', 20, yPos)
      yPos += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      results.suggestions.forEach((suggestion, idx) => {
        const lines = doc.splitTextToSize(`${idx + 1}. ${suggestion}`, 170)
        doc.text(lines, 20, yPos)
        yPos += lines.length * 5 + 3
      })
    }
    
    doc.save('bioscan-protocol-analysis.pdf')
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Protocol Analysis Results</h2>
        <div className="header-actions">
          <button className="export-button" onClick={exportToPDF}>
            📄 Export PDF
          </button>
          <button className="reset-button" onClick={onReset}>
            Analyze Another Protocol
          </button>
        </div>
      </div>

      {/* Split Panel Layout */}
      <div className={`results-layout ${uploadedFile ? 'split-view' : 'single-view'}`}>
        {/* PDF Preview Panel (Left Side) */}
        {uploadedFile && (
          <div className="pdf-panel">
            <PDFViewer 
              file={uploadedFile} 
              highlights={getHighlights()} 
              activeHighlightIndex={activeHighlightIndex}
              onHighlightChange={setActiveHighlightIndex}
              onHighlightMatches={setHighlightMatches}
            />
          </div>
        )}

        {/* Analysis Results (Right Side or Full Width) */}
        <div className="analysis-panel">
          {/* Score Calculation Methodology */}
          <div className="methodology-section">
            <h3>📊 How We Calculate Your Success Score</h3>
            <div className="methodology-grid">
              <div className="methodology-item">
                <div className="methodology-icon">🧪</div>
                <div className="methodology-content">
                  <h4>Protocol Completeness</h4>
                  <p>Materials list, step-by-step procedures, safety protocols, and equipment specifications</p>
                </div>
              </div>
              <div className="methodology-item">
                <div className="methodology-icon">🎯</div>
                <div className="methodology-content">
                  <h4>Measurement Specificity</h4>
                  <p>Precise quantities, temperatures, times, concentrations, and wavelengths</p>
                </div>
              </div>
              <div className="methodology-item">
                <div className="methodology-icon">✅</div>
                <div className="methodology-content">
                  <h4>Controls & Standards</h4>
                  <p>Positive/negative controls, calibration standards, and validation steps</p>
                </div>
              </div>
              <div className="methodology-item">
                <div className="methodology-icon">⚠️</div>
                <div className="methodology-content">
                  <h4>Safety & Best Practices</h4>
                  <p>Hazard identification, proper handling procedures, and scientific rigor</p>
                </div>
              </div>
            </div>
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
          {uploadedFile && (
            <p className="interaction-hint">💡 Hover over issues to see them highlighted on the PDF</p>
          )}
          <div className="issues-list">
            {results.critical_issues.map((issue, index) => {
              const globalIndex = index
              const issueKey = `critical-${index}`
              const isActive = activeHighlightIndex === globalIndex
              const hasMatch = uploadedFile && highlightMatches.includes(globalIndex)
              const hasFix = generatedFixes[issueKey]
              const isFixExpanded = expandedFixes[issueKey]
              const isFixSelected = selectedFixes[issueKey]
              
              return (
                <div 
                  key={index} 
                  className={`issue-card ${isActive ? 'active' : ''} ${!hasMatch && uploadedFile ? 'no-pdf-match' : ''} ${hasFix ? 'has-fix' : ''}`}
                  onMouseEnter={() => setActiveHighlightIndex(globalIndex)}
                  onMouseLeave={() => setActiveHighlightIndex(null)}
                  onClick={() => setActiveHighlightIndex(isActive ? null : globalIndex)}
                >
                  <div className="issue-number">#{globalIndex + 1}</div>
                  <div className="issue-content">
                    <h4>
                      {issue.issue}
                      {!hasMatch && uploadedFile && (
                        <span className="no-match-badge" title="This issue is conceptual and may not appear as text in the PDF">
                          📄 Not visible in PDF
                        </span>
                      )}
                    </h4>
                    <p>{issue.description}</p>
                    
                    {/* Fix Generation Section */}
                    <div className="fix-section" onClick={(e) => e.stopPropagation()}>
                      {!hasFix && (
                        <button
                          className="generate-fix-btn"
                          onClick={() => generateFix(issueKey, issue.issue, issue.description)}
                          disabled={loadingFixes[issueKey]}
                        >
                          {loadingFixes[issueKey] ? (
                            <>⏳ Generating Fix...</>
                          ) : (
                            <>🔧 Generate AI Fix</>
                          )}
                        </button>
                      )}
                      
                      {hasFix && (
                        <div className="fix-container">
                          <div className="fix-header">
                            <label className="fix-checkbox">
                              <input
                                type="checkbox"
                                checked={isFixSelected || false}
                                onChange={() => toggleFixSelection(issueKey)}
                              />
                              <span className="checkbox-label">Apply this fix</span>
                            </label>
                            <button
                              className="toggle-fix-btn"
                              onClick={() => setExpandedFixes(prev => ({ ...prev, [issueKey]: !prev[issueKey] }))}
                            >
                              {isFixExpanded ? '▼ Hide Fix' : '▶ Show Fix'}
                            </button>
                          </div>
                          
                          {isFixExpanded && (
                            <div className="fix-content">
                              <div className="fix-suggestion">
                                <h5>💡 Suggested Fix:</h5>
                                <p>{generatedFixes[issueKey].fix_suggestion}</p>
                              </div>
                              
                              <div className="fix-steps">
                                <h5>📋 Implementation Steps:</h5>
                                <ol>
                                  {generatedFixes[issueKey].implementation_steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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
          {uploadedFile && (
            <p className="interaction-hint">💡 Hover over warnings to see them highlighted on the PDF</p>
          )}
          <div className="issues-list">
            {results.warnings.map((warning, index) => {
              const globalIndex = (results.critical_issues?.length || 0) + index
              const issueKey = `warning-${index}`
              const isActive = activeHighlightIndex === globalIndex
              const hasMatch = uploadedFile && highlightMatches.includes(globalIndex)
              const hasFix = generatedFixes[issueKey]
              const isFixExpanded = expandedFixes[issueKey]
              const isFixSelected = selectedFixes[issueKey]
              
              return (
                <div 
                  key={index} 
                  className={`issue-card ${isActive ? 'active' : ''} ${!hasMatch && uploadedFile ? 'no-pdf-match' : ''} ${hasFix ? 'has-fix' : ''}`}
                  onMouseEnter={() => setActiveHighlightIndex(globalIndex)}
                  onMouseLeave={() => setActiveHighlightIndex(null)}
                  onClick={() => setActiveHighlightIndex(isActive ? null : globalIndex)}
                >
                  <div className="issue-number">#{globalIndex + 1}</div>
                  <div className="issue-content">
                    <h4>
                      {warning.issue}
                      {!hasMatch && uploadedFile && (
                        <span className="no-match-badge" title="This issue is conceptual and may not appear as text in the PDF">
                          📄 Not visible in PDF
                        </span>
                      )}
                    </h4>
                    <p>{warning.description}</p>
                    
                    {/* Fix Generation Section */}
                    <div className="fix-section" onClick={(e) => e.stopPropagation()}>
                      {!hasFix && (
                        <button
                          className="generate-fix-btn"
                          onClick={() => generateFix(issueKey, warning.issue, warning.description)}
                          disabled={loadingFixes[issueKey]}
                        >
                          {loadingFixes[issueKey] ? (
                            <>⏳ Generating Fix...</>
                          ) : (
                            <>🔧 Generate AI Fix</>
                          )}
                        </button>
                      )}
                      
                      {hasFix && (
                        <div className="fix-container">
                          <div className="fix-header">
                            <label className="fix-checkbox">
                              <input
                                type="checkbox"
                                checked={isFixSelected || false}
                                onChange={() => toggleFixSelection(issueKey)}
                              />
                              <span className="checkbox-label">Apply this fix</span>
                            </label>
                            <button
                              className="toggle-fix-btn"
                              onClick={() => setExpandedFixes(prev => ({ ...prev, [issueKey]: !prev[issueKey] }))}
                            >
                              {isFixExpanded ? '▼ Hide Fix' : '▶ Show Fix'}
                            </button>
                          </div>
                          
                          {isFixExpanded && (
                            <div className="fix-content">
                              <div className="fix-suggestion">
                                <h5>💡 Suggested Fix:</h5>
                                <p>{generatedFixes[issueKey].fix_suggestion}</p>
                              </div>
                              
                              <div className="fix-steps">
                                <h5>📋 Implementation Steps:</h5>
                                <ol>
                                  {generatedFixes[issueKey].implementation_steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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

      {/* Generate Improved Protocol Button */}
      {Object.keys(generatedFixes).length > 0 && !improvedProtocol && (
        <div className="generate-protocol-section">
          <button
            className="generate-protocol-btn"
            onClick={generateImprovedProtocol}
            disabled={generatingProtocol || Object.values(selectedFixes).filter(Boolean).length === 0}
          >
            {generatingProtocol ? (
              <>⏳ Generating Improved Protocol...</>
            ) : (
              <>🚀 Generate Improved Protocol ({Object.values(selectedFixes).filter(Boolean).length} fixes selected)</>
            )}
          </button>
          <p className="protocol-hint">
            Select the fixes you want to apply using the checkboxes above, then click to generate an improved version of your protocol.
          </p>
        </div>
      )}

      {/* Improved Protocol Section */}
      {improvedProtocol && (
        <div className="improved-protocol-section" id="improved-protocol-section">
          <div className="improved-header">
            <h3>✨ Improved Protocol Generated</h3>
            <div className="improvement-metrics">
              <div className="metric">
                <span className="metric-label">Original Score:</span>
                <span className="metric-value" style={{ color: getScoreColor(results.success_probability) }}>
                  {results.success_probability}%
                </span>
              </div>
              <div className="metric-arrow">→</div>
              <div className="metric">
                <span className="metric-label">New Score:</span>
                <span className="metric-value" style={{ color: getScoreColor(improvedProtocol.new_success_probability) }}>
                  {improvedProtocol.new_success_probability}%
                </span>
              </div>
              <div className="metric-improvement">
                <span className="improvement-badge">
                  +{improvedProtocol.new_success_probability - results.success_probability}% improvement
                </span>
              </div>
            </div>
          </div>

          <div className="changes-summary">
            <h4>📝 Changes Made:</h4>
            <ul>
              {improvedProtocol.changes_made.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>

          <div className="protocol-content">
            <div className="protocol-header">
              <h4>📄 Improved Protocol:</h4>
              <button className="download-protocol-btn" onClick={downloadImprovedProtocol}>
                ⬇️ Download
              </button>
            </div>
            <div 
              className="protocol-text" 
              dangerouslySetInnerHTML={{ __html: formatProtocol(improvedProtocol.improved_protocol) }}
            />
          </div>

          {/* Generate Shopping List Button */}
          <div className="shopping-list-trigger">
            <button 
              className="generate-shopping-btn" 
              onClick={generateShoppingList}
              disabled={loadingShoppingList}
            >
              {loadingShoppingList ? '🔄 Generating...' : '🛒 Generate Shopping List'}
            </button>
            <p className="shopping-hint">Get all materials needed for the improved protocol</p>
          </div>
        </div>
      )}

      {/* Shopping List Section */}
      {shoppingList && (
        <div className="shopping-list-section" id="shopping-list-section">
          <div className="shopping-header">
            <h3>🛒 Shopping List</h3>
            <div className="total-cost">
              <span className="cost-label">Total Estimated Cost:</span>
              <span className="cost-value">${shoppingList.total_cost.toLocaleString()}</span>
            </div>
          </div>

          <div className="shopping-categories">
            {shoppingList.categories.map((category, catIndex) => (
              <div key={catIndex} className="shopping-category">
                <h4 className="category-name">{category.name}</h4>
                <div className="category-items">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="shopping-item">
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-specs">
                          {item.concentration && <span className="spec">{item.concentration}</span>}
                          {item.quantity && <span className="spec">{item.quantity}</span>}
                        </div>
                      </div>
                      <div className="item-price">${item.estimated_price}</div>
                    </div>
                  ))}
                </div>
                <div className="category-subtotal">
                  Subtotal: ${category.items.reduce((sum, item) => sum + item.estimated_price, 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="shopping-footer">
            <p className="pricing-note">
              💡 All materials from improved protocol. Prices estimated from typical supplier catalogs (Sigma-Aldrich, Thermo Fisher, VWR)
            </p>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

export default Results
