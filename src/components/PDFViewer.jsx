import { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import './PDFViewer.css'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const PDFViewer = ({ file, highlights, activeHighlightIndex, onHighlightChange, onHighlightMatches }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [textContent, setTextContent] = useState({})
  const [highlightPositions, setHighlightPositions] = useState([])
  const [zoom, setZoom] = useState(0.9)
  const pageRef = useRef(null)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2.0))
  }

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
  }

  // Extract text content and find highlight positions
  useEffect(() => {
    if (!pageRef.current || !highlights || highlights.length === 0) {
      setHighlightPositions([])
      return
    }

    const findTextInPage = async () => {
      const textLayer = pageRef.current.querySelector('.react-pdf__Page__textContent')
      if (!textLayer) {
        return
      }

      const newHighlights = []
      const textItems = textLayer.querySelectorAll('span')
      
      // Process each issue separately to maintain mapping
      highlights.forEach((highlight, issueIndex) => {
        const keywords = highlight.keywords || extractKeywords(highlight.text)
        
        // Find matches for this specific issue
        const matchesForIssue = []
        textItems.forEach(span => {
          const spanText = span.textContent.toLowerCase()
          
          keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase()
            if (spanText.includes(keywordLower) && keywordLower.length > 3) {
              const rect = span.getBoundingClientRect()
              const pageRect = textLayer.getBoundingClientRect()
              
              matchesForIssue.push({
                left: rect.left - pageRect.left,
                top: rect.top - pageRect.top,
                width: rect.width,
                height: rect.height,
                severity: highlight.severity,
                text: highlight.text,
                keyword: keyword,
                issueIndex: issueIndex // Map back to specific issue
              })
            }
          })
        })
        
        // Only add first match for each issue to avoid clutter
        if (matchesForIssue.length > 0) {
          const match = matchesForIssue[0]
          
          // Check if this position already has a highlight
          const existingIndex = newHighlights.findIndex(h => 
            Math.abs(h.left - match.left) < 10 &&
            Math.abs(h.top - match.top) < 10
          )
          
          if (existingIndex >= 0) {
            // Position already highlighted - keep critical over warning
            if (match.severity === 'critical' && newHighlights[existingIndex].severity === 'warning') {
              newHighlights[existingIndex] = match
            }
          } else {
            newHighlights.push(match)
          }
        }
      })
      
      setHighlightPositions(newHighlights)
      
      // Report which issues have matches to parent component
      if (onHighlightMatches) {
        const matchedIndices = newHighlights.map(h => h.issueIndex)
        onHighlightMatches(matchedIndices)
      }
    }

    setTimeout(findTextInPage, 500)
  }, [pageNumber, highlights, onHighlightMatches])

  // Extract meaningful keywords from issue text
  const extractKeywords = (text) => {
    const keywords = []
    
    // Extract quoted phrases
    const quotes = text.match(/"([^"]+)"/g)
    if (quotes) {
      quotes.forEach(q => keywords.push(q.replace(/"/g, '')))
    }
    
    // Extract measurements (e.g., "450nm", "30 minutes", "2mg/ml")
    const measurements = text.match(/\d+\s*(?:nm|min|minutes|hours|mg|ml|μl|°C|C|M|mM|µM|rpm|g)/gi)
    if (measurements) {
      measurements.forEach(m => keywords.push(m))
    }
    
    // Extract standalone numbers that might be important
    const numbers = text.match(/\b\d+\b/g)
    if (numbers) {
      numbers.forEach(n => keywords.push(n))
    }
    
    // Remove common words and extract meaningful terms
    const commonWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those', 'with', 'from', 'not'
    ]
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
    
    keywords.push(...words)
    
    return [...new Set(keywords)] // Remove duplicates
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-header">
        <h3>📄 Original Protocol</h3>
        <div className="pdf-controls">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
            ←
          </button>
          <span>
            Page {pageNumber} of {numPages || '...'}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            →
          </button>
          <div className="zoom-divider"></div>
          <button onClick={zoomOut} disabled={zoom <= 0.5} title="Zoom out">
            −
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn} disabled={zoom >= 2.0} title="Zoom in">
            +
          </button>
        </div>
      </div>

      <div className="pdf-document" ref={pageRef}>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="pdf-loading">
              <div className="pdf-spinner"></div>
              <p>Loading PDF...</p>
            </div>
          }
          error={
            <div className="pdf-error">
              <p>Failed to load PDF</p>
            </div>
          }
        >
          <div className="pdf-page-wrapper">
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              scale={zoom}
            />
            
            {/* Highlight overlays - only show active or all if none selected */}
            {highlightPositions.map((pos, index) => {
              const isActive = activeHighlightIndex === null || activeHighlightIndex === pos.issueIndex
              return (
                <div
                  key={index}
                  className={`pdf-highlight-overlay ${pos.severity} ${isActive ? 'active' : 'inactive'}`}
                  style={{
                    left: `${pos.left}px`,
                    top: `${pos.top}px`,
                    width: `${pos.width}px`,
                    height: `${pos.height}px`
                  }}
                  title={`Issue #${pos.issueIndex + 1}: ${pos.text}`}
                />
              )
            })}
          </div>
        </Document>
      </div>
    </div>
  )
}

export default PDFViewer
