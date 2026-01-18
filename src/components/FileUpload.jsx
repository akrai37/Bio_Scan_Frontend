import { useState, useRef } from 'react'
import axios from 'axios'
import './FileUpload.css'

const FileUpload = ({ onAnalysisComplete, onAnalysisStart, onError, onFileSelected }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onError('Please upload a PDF file')
      return
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      onError('File size exceeds 20MB limit')
      return
    }

    setSelectedFile(file)
    if (onFileSelected) {
      onFileSelected(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    onAnalysisStart()

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post('http://localhost:8000/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout
      })

      onAnalysisComplete(response.data)
      setSelectedFile(null)
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        onError('Request timeout. The file might be too large or the server is slow.')
      } else if (error.response) {
        onError(error.response.data.detail || 'Analysis failed. Please try again.')
      } else if (error.request) {
        onError('Cannot connect to server. Make sure the backend is running on port 8000.')
      } else {
        onError('An unexpected error occurred. Please try again.')
      }
      setSelectedFile(null)
    }
  }

  const onButtonClick = () => {
    fileInputRef.current.click()
  }
  const handleDemoProtocol = async (type) => {
    onAnalysisStart()
    
    // Simulate demo protocol analysis with mock data
    setTimeout(() => {
      if (type === 'good') {
        onAnalysisComplete({
          success_probability: 88,
          critical_issues: [],
          warnings: [
            {
              issue: "Consider Adding Statistical Power Analysis",
              description: "While the protocol is well-designed, including a formal statistical power analysis would strengthen the experimental design and ensure adequate sample size."
            }
          ],
          passed_checks: [
            {
              issue: "Comprehensive Controls Included",
              description: "Protocol includes negative, positive, and blank controls - excellent experimental design."
            },
            {
              issue: "Proper Replication Specified",
              description: "All experiments will be performed in triplicate (n=3), ensuring statistical reliability."
            },
            {
              issue: "Detailed Reagent Concentrations",
              description: "All reagents have specified concentrations and preparation methods."
            },
            {
              issue: "Clear Statistical Analysis Plan",
              description: "Protocol specifies ANOVA with Tukey post-hoc test for multiple comparisons."
            }
          ],
          estimated_cost: "$450-600",
          estimated_time: "Approximately 24-30 hours",
          suggestions: [
            "Consider adding a power analysis to justify sample size",
            "Include quality control checkpoints throughout the protocol",
            "Specify acceptance criteria for each control"
          ],
          raw_analysis: "Demo analysis - Good Protocol"
        })
      } else {
        onAnalysisComplete({
          success_probability: 32,
          critical_issues: [
            {
              issue: "No Controls Specified",
              description: "Protocol lacks any mention of negative, positive, or blank controls. Without controls, it will be impossible to validate results or distinguish specific signals from background noise."
            },
            {
              issue: "No Replication Mentioned",
              description: "Protocol does not specify number of replicates. Single measurements are unreliable and provide no statistical power."
            },
            {
              issue: "Vague Reagent Descriptions",
              description: "Multiple reagents lack concentration specifications (e.g., 'add antibody' without concentration). This will lead to irreproducible results."
            }
          ],
          warnings: [
            {
              issue: "Missing Buffer Compositions",
              description: "Buffer compositions not specified. Different buffer formulations can significantly affect results."
            },
            {
              issue: "No Statistical Analysis Plan",
              description: "No mention of how data will be analyzed statistically."
            },
            {
              issue: "Unclear Sample Size",
              description: "Number of biological samples not specified."
            }
          ],
          passed_checks: [
            {
              issue: "General Methodology Present",
              description: "Basic experimental steps are outlined."
            }
          ],
          estimated_cost: "Unknown - insufficient detail",
          estimated_time: "Unknown - likely to require multiple attempts",
          suggestions: [
            "Add negative, positive, and blank controls",
            "Specify n=3 minimum for all measurements",
            "Provide exact concentrations for all reagents",
            "Define buffer compositions (pH, molarity, components)",
            "Include statistical analysis plan (ANOVA, t-test, etc.)",
            "Specify biological sample size and technical replicates",
            "Add acceptance criteria for quality control"
          ],
          raw_analysis: "Demo analysis - Bad Protocol"
        })
      }
    }, 2000) // Simulate API delay
  }
  return (
    <div className="file-upload-container">
      {!selectedFile && (
        <div className="demo-buttons">
          <p className="demo-label">or try a demo protocol:</p>
          <button className="demo-button good" onClick={() => handleDemoProtocol('good')}>
            ✅ Good Protocol Example
          </button>
          <button className="demo-button bad" onClick={() => handleDemoProtocol('bad')}>
            ❌ Bad Protocol Example
          </button>
        </div>
      )}
      
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-selected' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {!selectedFile ? (
          <>
            <div className="upload-icon">📄</div>
            <h3>Upload Your Protocol</h3>
            <p>Drag and drop your PDF here, or click to browse</p>
            <button className="browse-button" onClick={onButtonClick}>
              Browse Files
            </button>
            <span className="file-info">PDF only, max 20MB</span>
          </>
        ) : (
          <>
            <div className="file-preview">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button 
                className="remove-file"
                onClick={() => setSelectedFile(null)}
              >
                ✕
              </button>
            </div>
            <button 
              className="analyze-button"
              onClick={handleUpload}
            >
              Analyze Protocol
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default FileUpload
