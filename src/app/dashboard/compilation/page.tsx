'use client'

import { useEffect, useState, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

type Submission = {
  id: string
  createdAt: string
  artistName: string
  songTitle: string
  genre: string
  releaseStatus: string
  radioAppropriate: string
  status: string
  selectedForCompilation: boolean
  email: string
  phone: string
  firstName: string
  lastName: string
}

export default function CompilationDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Submission[]>([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkApplying, setBulkApplying] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/compilation-list')
      const data = await res.json()
      setSubmissions(data.docs ?? [])
    } catch (e) {
      console.error('Failed to fetch submissions', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  async function handleCellEdit(event: { data: Submission; colDef: { field?: string } }) {
    const { data } = event
    try {
      await fetch(`/api/compilation-list/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: data.status,
          selectedForCompilation: data.selectedForCompilation,
        }),
      })
    } catch (e) {
      console.error('Failed to update submission', e)
    }
  }

  async function handleBulkApply() {
    if (!bulkStatus || selectedRows.length === 0) return
    setBulkApplying(true)
    await Promise.all(
      selectedRows.map((row) =>
        fetch(`/api/compilation-list/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: bulkStatus }),
        }),
      ),
    )
    await fetchSubmissions()
    setSelectedRows([])
    setBulkStatus('')
    setBulkApplying(false)
  }

  const colDefs: ColDef<Submission>[] = [
    {
      field: 'createdAt',
      headerName: 'Submitted',
      width: 150,
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
    { field: 'email', headerName: 'Email', width: 200, filter: true, sortable: true },
    { field: 'phone', headerName: 'Phone', width: 130 },
    {
      headerName: 'Contact',
      width: 160,
      filter: true,
      sortable: true,
      valueGetter: (p: { data: Submission }) =>
        p.data ? `${p.data.firstName} ${p.data.lastName}` : '',
    },
    {
      field: 'releaseStatus',
      headerName: 'Release',
      width: 150,
      filter: true,
      sortable: true,
      valueFormatter: (p: { value: string }) =>
        ({
          unreleased: 'Unreleased',
          self_released: 'Self-Released',
          on_label: 'On Label',
          soundcloud: 'Soundcloud',
        })[p.value] ?? p.value,
    },
    {
      field: 'radioAppropriate',
      headerName: 'Radio',
      width: 130,
      filter: true,
      sortable: true,
      valueFormatter: (p: { value: string }) =>
        p.value === 'radio_friendly' ? 'Friendly' : 'Advisory',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      editable: true,
      filter: true,
      sortable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['pending', 'under_review', 'selected', 'not_selected'],
      },
      valueFormatter: (p: { value: string }) =>
        ({
          pending: 'Pending',
          under_review: 'Under Review',
          selected: 'Selected',
          not_selected: 'Not Selected',
        })[p.value] ?? p.value,
      cellStyle: (params: { value: string }) => ({
        color: '#0f0f1a',
        background:
          params.value === 'selected'
            ? '#a5d6a7'
            : params.value === 'not_selected'
              ? '#ef9a9a'
              : params.value === 'under_review'
                ? '#ffb300'
                : '#444',
        display: 'flex',
        alignItems: 'center',
      }),
    },
    {
      field: 'selectedForCompilation',
      headerName: 'Selected',
      width: 110,
      editable: true,
      filter: true,
      sortable: true,
      cellEditor: 'agCheckboxCellEditor',
      cellRenderer: 'agCheckboxCellRenderer',
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
  ]

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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px' }}>
            Compilation Submissions
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
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            style={{
              background: '#0f0f1a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: '0.85rem',
              fontFamily: "'Courier New', monospace",
            }}
          >
            <option value="">Set status…</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="selected">Selected</option>
            <option value="not_selected">Not Selected</option>
          </select>
          <button
            onClick={handleBulkApply}
            disabled={!bulkStatus}
            style={{
              background: bulkStatus ? '#e63946' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: '0.85rem',
              fontFamily: "'Courier New', monospace",
              cursor: bulkStatus ? 'pointer' : 'not-allowed',
            }}
          >
            Apply →
          </button>
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
          />
        </div>
      )}

      {bulkApplying && (
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
              Updating {selectedRows.length} submission{selectedRows.length !== 1 ? 's' : ''}…
            </p>
            <div style={{ height: 6, background: '#0f0f1a', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  background: '#e63946',
                  borderRadius: 99,
                  animation: 'pulse-bar 1.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-bar {
          0% { opacity: 1; transform: scaleX(0.3); transform-origin: left; }
          50% { opacity: 1; transform: scaleX(1); transform-origin: left; }
          100% { opacity: 1; transform: scaleX(0.3); transform-origin: left; }
        }
      `}</style>
    </div>
  )
}
