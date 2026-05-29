'use client'

import { useEffect, useState, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'
import type { CellClickedEvent } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

type Submission = {
  id: string
  createdAt: string
  artistName: string
  songTitle: string
  name: string
  email: string
  phone: string
  genre: string
  radioAppropriate: string
  portlandBased: string
  downloadLink: string
  trackUrl: string
  trackFilename: string
  website: string
  status: string
  reviewed: boolean
}

export default function RadioDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Submission[]>([])
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/radio-list')
      const data = await res.json()
      setSubmissions(data.docs ?? [])
    } catch (e) {
      console.error('Failed to fetch radio submissions', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  async function handleCellEdit(event: { data: Submission }) {
    const { data } = event
    try {
      await fetch(`/api/radio-list/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: data.reviewed }),
      })
    } catch (e) {
      console.error('Failed to update submission', e)
    }
  }

  async function handleBulkDownload() {
    const toDownload = selectedRows.filter((r) => r.trackUrl)
    if (toDownload.length === 0) return

    setDownloading(true)
    setDownloadProgress(0)

    for (let i = 0; i < toDownload.length; i++) {
      const sub = toDownload[i]
      try {
        const res = await fetch(sub.trackUrl)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = sub.trackFilename || `${sub.artistName}_${sub.songTitle}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        console.error('Failed to download', sub.trackFilename, e)
      }
      setDownloadProgress(Math.round(((i + 1) / toDownload.length) * 100))
      // Small delay between downloads to avoid browser blocking
      await new Promise((r) => setTimeout(r, 500))
    }

    setDownloading(false)
    setDownloadProgress(0)
  }
  async function handleCellClick(event: CellClickedEvent<Submission>) {
    if (event.colDef.field === 'downloadLink' && event.data?.downloadLink) {
      const url = event.data.downloadLink.startsWith('http')
        ? event.data.downloadLink
        : `https://${event.data.downloadLink}`
      window.open(url, '_blank')
    }
    if (event.colDef.field === 'trackUrl' && event.data?.trackFilename) {
      const res = await fetch(
        `/api/radio-download?filename=${encodeURIComponent(event.data.trackFilename)}`,
      )
      const { url } = await res.json()
      if (url) window.open(url, '_blank')
    }
  }

  const colDefs: ColDef<Submission>[] = [
    {
      field: 'createdAt',
      headerName: 'Submitted',
      width: 130,
      sortable: true,
      valueFormatter: (p: { value: string }) =>
        p.value
          ? new Date(p.value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '',
    },
    { field: 'artistName', headerName: 'Artist', width: 160, filter: true, sortable: true },
    { field: 'songTitle', headerName: 'Song', width: 180, filter: true, sortable: true },
    {
      field: 'genre',
      headerName: 'Genre',
      width: 150,
      filter: true,
      sortable: true,
      valueFormatter: (p: { value: string }) =>
        p.value?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '',
    },
    {
      field: 'downloadLink',
      headerName: 'DL URL',
      width: 110,
      cellStyle: (p: { value: string }) => ({
        color: p.value ? '#ff8c42' : '#666',
        cursor: p.value ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
      }),
      valueFormatter: (p: { value: string }) => (p.value ? '↗ Open Link' : '—'),
    },
    {
      field: 'trackUrl',
      headerName: 'MP3',
      width: 110,
      cellStyle: (p: { value: string }) => ({
        color: p.value ? '#a5d6a7' : '#666',
        cursor: p.value ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
      }),
      valueFormatter: (p: { value: string }) => (p.value ? '↓ Download' : '—'),
    },
    {
      field: 'reviewed',
      headerName: 'Reviewed',
      width: 100,
      editable: true,
      filter: true,
      sortable: true,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
    {
      field: 'radioAppropriate',
      headerName: 'Radio',
      width: 130,
      filter: true,
      sortable: true,
      valueFormatter: (p: { value: string }) =>
        p.value === 'radio_friendly'
          ? 'Friendly'
          : p.value === 'parental_advisory'
            ? 'Advisory'
            : p.value,
    },
    {
      field: 'portlandBased',
      headerName: 'PDX',
      width: 80,
      filter: true,
      sortable: true,
    },
    { field: 'name', headerName: 'Contact', width: 140, filter: true, sortable: true },
    { field: 'email', headerName: 'Email', width: 200, filter: true, sortable: true },
    { field: 'phone', headerName: 'Phone', width: 130 },
    {
      field: 'website',
      headerName: 'Website',
      width: 160,
      cellRenderer: (p: { value: string }) =>
        p.value
          ? `<a href="${p.value}" target="_blank" rel="noopener noreferrer" style="color:#ff8c42">${p.value}</a>`
          : '',
    },
  ]

  const mp3Count = selectedRows.filter((r) => r.trackUrl).length

  return (
    <div style={{ padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px', color: '#e8e8e8' }}>
            Radio Submissions
          </h1>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {selectedRows.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: '#1a1a2e',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span
            style={{ color: '#aaa', fontSize: '0.85rem', fontFamily: "'Courier New', monospace" }}
          >
            {selectedRows.length} selected
          </span>
          <button
            onClick={handleBulkDownload}
            disabled={mp3Count === 0 || downloading}
            style={{
              background: mp3Count > 0 ? '#e63946' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: '0.85rem',
              fontFamily: "'Courier New', monospace",
              cursor: mp3Count > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {downloading
              ? `Downloading… ${downloadProgress}%`
              : `Download ${mp3Count} MP3${mp3Count !== 1 ? 's' : ''}`}
          </button>
          {mp3Count < selectedRows.length && (
            <span
              style={{ color: '#888', fontSize: '0.8rem', fontFamily: "'Courier New', monospace" }}
            >
              {selectedRows.length - mp3Count} selected have no MP3 (download link only)
            </span>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#666' }}>Loading submissions…</p>
      ) : (
        <div className="ag-theme-quartz-dark" style={{ flex: 1, minHeight: 400 }}>
          <AgGridReact
            rowData={submissions}
            columnDefs={colDefs}
            headerHeight={48}
            rowSelection={{ mode: 'multiRow' }}
            onSelectionChanged={(e) => setSelectedRows(e.api.getSelectedRows())}
            defaultColDef={{
              resizable: true,
              autoHeight: false,
              cellStyle: { display: 'flex', alignItems: 'center' },
            }}
            onCellValueChanged={handleCellEdit}
            pagination={true}
            paginationPageSize={25}
            stopEditingWhenCellsLoseFocus={true}
            paginationPageSizeSelector={[25, 50, 100]}
            onCellClicked={handleCellClick}
          />
        </div>
      )}

      {downloading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: 12,
              padding: '2rem 2.5rem',
              textAlign: 'center',
              maxWidth: 320,
              width: '90%',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <p
              style={{
                color: '#fff',
                fontFamily: 'Georgia, serif',
                fontSize: '1rem',
                marginBottom: '1rem',
              }}
            >
              Downloading {mp3Count} MP3{mp3Count !== 1 ? 's' : ''}…
            </p>
            <div style={{ height: 6, background: '#0f0f1a', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${downloadProgress}%`,
                  background: '#e63946',
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <p
              style={{
                color: '#888',
                fontSize: '0.8rem',
                fontFamily: "'Courier New', monospace",
                marginTop: '0.75rem',
              }}
            >
              {downloadProgress}% complete
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
