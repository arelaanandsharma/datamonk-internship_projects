import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function App() {
  const [files, setFiles] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/api/files')
      setFiles(res.data)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load files')
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    setError('')
    if (!selected) return

    const form = new FormData()
    form.append('file', selected)
    setLoading(true)
    try {
      await axios.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSelected(null)
      await fetchFiles()
    } catch (e) {
      setError(e?.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return
    setLoading(true)
    setError('')
    try {
      await axios.delete(`/api/files/${id}`)
      await fetchFiles()
    } catch (e) {
      setError(e?.response?.data?.error || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-pink-600 to-teal-600 bg-clip-text text-transparent">
          My Drive (S3 + SQLite)
        </h1>
        <p className="text-gray-700 mt-2">Upload • List • Delete</p>
      </header>

      <form onSubmit={handleUpload} className="glass rounded-2xl p-6 shadow-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose a file to upload (max ~50MB)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            onChange={(e) => setSelected(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700
                       hover:file:bg-indigo-100 cursor-pointer"
          />
          <button
            disabled={!selected || loading}
            className="px-5 py-2 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500
                       hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {selected && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: <span className="font-medium">{selected.name}</span> ({selected.size} bytes)
          </p>
        )}
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-100 text-red-700">{error}</div>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Your Files</h2>

        {files.length === 0 ? (
          <div className="p-6 text-center text-gray-600 glass rounded-2xl">
            No files yet. Upload something!
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {files.map((f) => (
              <li key={f.id} className="glass rounded-2xl p-4 shadow-md border border-white/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{f.filename}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {f.mimetype} • {f.size} bytes
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded: {new Date(f.uploaded_at + 'Z').toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="px-3 py-1.5 rounded-lg text-white text-sm bg-gradient-to-r from-rose-500 to-red-500 hover:opacity-90"
                    disabled={loading}
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
