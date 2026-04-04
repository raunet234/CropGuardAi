import React, { useState, useRef } from 'react'
import Layout from '../components/Layout'
import ConfidenceGauge from '../components/ConfidenceGauge'
import { useActivityLogger } from '../hooks/useActivityLogger'
import { detectDisease } from '../services/api'

export default function DiseaseDetectionPage() {
  const { logActivity } = useActivityLogger()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  function handleFile(file) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return setError('File too large (max 10MB)')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Only JPEG, PNG, WEBP allowed')
    setError('')
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      setImage(e.target.result.split(',')[1]) // base64 only
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function handleDetect() {
    if (!image) return
    setLoading(true)
    setError('')
    try {
      const res = await detectDisease(image)
      setResult(res.data)
      logActivity('disease', res.data.disease || 'Disease Scan', res.data.crop || '', res.data)
    } catch (err) {
      setError('Detection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-800">🔬 Plant Disease Detection</h1>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">AI Vision Analysis</span>
        </div>
        <p className="text-gray-500 text-sm">Upload a plant leaf photo — our AI analyses it to identify disease symptoms, lesion patterns, and severity.</p>
      </div>

      {/* Stub warning */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
        <span className="text-yellow-600 text-lg">⚠️</span>
        <div>
          <p className="text-yellow-800 font-semibold text-sm">AI model integration pending</p>
          <p className="text-yellow-700 text-xs mt-0.5">Connect your MobileNetV3 model in <code className="bg-yellow-100 px-1 rounded">backend/services/diseaseDetectionService.js</code></p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {/* Upload zone */}
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 text-sm">📤 Upload Plant Image</h2>
              <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-200">AI Vision Analysis</span>
            </div>

            <div
              className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center py-14 cursor-pointer transition-colors ${dragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain" />
              ) : (
                <>
                  <div className="text-5xl mb-3">🌿</div>
                  <p className="font-semibold text-gray-700">Drop image here or click to browse</p>
                  <p className="text-gray-400 text-sm mt-1">JPEG · PNG · WEBP — max 10 MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={handleDetect}
              disabled={!image || loading}
              className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⏳</span> Analyzing...</>
              ) : (
                <><span className="w-2 h-2 bg-white rounded-full" /> Detect Disease</>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">💡 Tips for best diagnosis results:</h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li>• Take a clear, close-up photo of the affected leaf — fill the frame</li>
              <li>• Use natural daylight — avoid harsh shadows or flash glare</li>
              <li>• Include both symptomatic and healthy areas of the leaf</li>
              <li>• Use a plain or light background for better contrast</li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 mb-4">🔍 Detection Results</h2>

              <div className="flex justify-center mb-4">
                <ConfidenceGauge value={result.confidence} />
              </div>

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{result.disease}</h3>
                {result.crop && result.crop !== 'Unknown' && (
                  <p className="text-gray-500 text-sm mt-1">Crop: {result.crop}</p>
                )}
              </div>

              {result.isStub && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
                  <p className="text-gray-500 text-xs">{result.symptoms}</p>
                </div>
              )}

              {!result.isStub && (
                <>
                  {result.symptoms && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-700 mb-1 uppercase">Symptoms</h4>
                      <p className="text-sm text-gray-600">{result.symptoms}</p>
                    </div>
                  )}
                  {result.treatment?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">Treatment Plan</h4>
                      <ol className="space-y-1">
                        {result.treatment.map((t, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-600 font-bold">{i+1}.</span>{t}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {result.pesticides?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">Pesticides</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.pesticides.map((p, i) => (
                          <span key={i} className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full border border-red-200">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.prevention?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase">Prevention</h4>
                      <ul className="space-y-1">
                        {result.prevention.map((p, i) => (
                          <li key={i} className="text-sm text-gray-600 flex gap-2"><span className="text-green-500">✓</span>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
