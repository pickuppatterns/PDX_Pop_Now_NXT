'use client'

import { useEffect, useState, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import type { ColDef } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

type Listener = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  genreFirst: string
  genreSecond: string
  isReturning: string
  mailingList: boolean
  status: string
  assignedBatch: string
  createdAt: string
}

export default function ListeningDashboard() {
  const [listeners, setListeners] = useState<Listener[]>([])
  const [loading, setLoading] = useState(true)

  const fetchListeners = useCallback(async () => {
    try {
      const res = await fetch('/api/listening-list')
      const data = await res.json()
      setListeners(data.docs ?? [])
    } catch (e) {
      console.error('Failed to fetch listeners', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListeners()
  }, [fetchListeners])

  async function handleCellEdit(event: { data: Listener; colDef: { field?: string } }) {
    const { data } = event
    try {
      await fetch(`/api/listening-list/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: data.status,
          assignedBatch: data.assignedBatch,
        }),
      })
    } catch (e) {
      console.error('Failed to update listener', e)
    }
  }

  const colDefs: ColDef<Listener>[] = [
    { field: 'firstName', headerName: 'First', width: 110, filter: true, sortable: true },
    { field: 'lastName', headerName: 'Last', width: 120, filter: true, sortable: true },
    { field: 'email', headerName: 'Email', width: 220, filter: true, sortable: true },
    { field: 'phone', headerName: 'Phone', width: 140 },
    {
      field: 'genreFirst',
      headerName: 'Genre 1',
      width: 140,
      filter: true,
      sortable: true,
      valueFormatter: (p: { value: string }) => p.value?.replace(/_/g, ' ') ?? '',
    },
    {
      field: 'genreSecond',
      headerName: 'Genre 2',
      width: 140,
      filter: true,
      sortable: true,
      valueFormatter: (p: { value: string }) => p.value?.replace(/_/g, ' ') ?? '',
    },
    {
      field: 'isReturning',
      headerName: 'Returning',
      width: 100,
      filter: true,
      sortable: true,
      valueFormatter: (p: { value: string }) => (p.value === 'yes' ? 'Yes' : 'No'),
    },
    {
      field: 'mailingList',
      headerName: 'Mailing List',
      width: 110,
      valueFormatter: (p: { value: boolean }) => (p.value ? 'Yes' : 'No'),
    },
    {
      field: 'assignedBatch',
      headerName: 'Group',
      width: 100,
      editable: true,
      filter: true,
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      editable: true,
      filter: true,
      sortable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['active', 'inactive'] },
      cellStyle: (params: { value: string }) => ({
        color: params.value === 'inactive' ? '#ef9a9a' : '#a5d6a7',
        display: 'flex',
        alignItems: 'center',
      }),
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 160,
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
            Listening Committee
          </h1>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
            {listeners.length} member{listeners.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Loading listeners…</p>
      ) : (
        <div className="ag-theme-quartz-dark" style={{ flex: 1, minHeight: 400 }}>
          <AgGridReact
            rowData={listeners}
            columnDefs={colDefs}
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
    </div>
  )
}
