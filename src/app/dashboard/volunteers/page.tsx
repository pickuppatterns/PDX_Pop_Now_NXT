'use client'

import { useEffect, useState, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

type Volunteer = {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact: string
  positions: string[]
  shirtSize: string
  experience: string
  accommodations: string
  heardFrom: string
  additionalNotes: string
  assignedShift: string
  assignedPosition: string
  createdAt: string
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVolunteers = useCallback(async () => {
    try {
      const res = await fetch('/api/volunteers-list')
      if (!res.ok) throw new Error('Failed to fetch volunteers')
      const data = await res.json()
      setVolunteers(data.docs ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load volunteers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVolunteers()
  }, [fetchVolunteers])

  const colDefs: ColDef<Volunteer>[] = [
    {
      field: 'firstName',
      headerName: 'First Name',
      width: 120,
      pinned: 'left',
      filter: true,
      sortable: true,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      width: 120,
      pinned: 'left',
      filter: true,
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      filter: true,
      sortable: true,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 140,
    },
    {
      field: 'emergencyContact',
      headerName: 'Emergency Contact',
      width: 200,
    },
    {
      field: 'positions',
      headerName: 'Positions',
      width: 200,
      valueFormatter: (p) => (Array.isArray(p.value) ? p.value.join(', ') : (p.value ?? '')),
      filter: true,
    },
    {
      field: 'shirtSize',
      headerName: 'Shirt',
      width: 80,
      filter: true,
      sortable: true,
    },
    {
      field: 'assignedShift',
      headerName: 'Assigned Shift',
      width: 200,
      editable: true,
      filter: true,
      sortable: true,
      cellStyle: { background: 'rgba(255,140,66,0.08)' },
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [
          'fri_setup',
          'fri_evening',
          'sat_afternoon',
          'sat_evening',
          'sun_afternoon',
          'sun_evening',
        ],
      },
      valueFormatter: (p) => {
        const labels: Record<string, string> = {
          fri_setup: 'Friday 12:00–5:00 PM (Set-Up)',
          fri_evening: 'Friday 4:30–10:00 PM',
          sat_afternoon: 'Saturday 12:30–5:30 PM',
          sat_evening: 'Saturday 5:00–10:00 PM',
          sun_afternoon: 'Sunday 12:30–5:30 PM',
          sun_evening: 'Sunday 5:00–10:00 PM',
        }
        return labels[p.value] ?? p.value ?? ''
      },
    },
    {
      field: 'assignedPosition',
      headerName: 'Assigned Position',
      width: 200,
      editable: true,
      filter: true,
      sortable: true,
      cellStyle: { background: 'rgba(255,140,66,0.08)' },
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [
          'setup',
          'merch',
          'green_room',
          'wristband',
          'videographer',
          'donation',
          'crowd_counter',
          'floater',
          'ice_cream',
          'kids_craft',
        ],
      },
      valueFormatter: (p) => {
        const labels: Record<string, string> = {
          setup: 'Set-Up Volunteer',
          merch: 'Merch Booth Volunteer',
          green_room: 'Green Room',
          wristband: '21+ Wristband Station',
          videographer: 'Videographer',
          donation: 'Donation Taker',
          crowd_counter: 'Crowd Counter',
          floater: 'Floater',
          ice_cream: 'Ice Cream & Popcorn',
          kids_craft: 'Kids Craft Table',
        }
        return labels[p.value] ?? p.value ?? ''
      },
    },
    {
      field: 'experience',
      headerName: 'Experience',
      width: 200,
    },
    {
      field: 'accommodations',
      headerName: 'Accommodations',
      width: 200,
    },
    {
      field: 'heardFrom',
      headerName: 'Heard From',
      width: 160,
      filter: true,
    },
    {
      field: 'additionalNotes',
      headerName: 'Notes',
      width: 200,
    },
    {
      field: 'createdAt',
      headerName: 'Signed Up',
      width: 140,
      sortable: true,
      valueFormatter: (p) =>
        p.value
          ? new Date(p.value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '',
    },
  ]

  async function handleCellEdit(event: {
    data: Volunteer
    colDef: { field?: string }
    newValue: string
  }) {
    const field = event.colDef.field
    if (!field) return

    try {
      await fetch(`/api/volunteers-list/${event.data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: event.newValue }),
      })
    } catch (e) {
      console.error('Failed to save cell edit:', e)
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}
          >
            PDX Pop Now! 2025
          </p>
          <h1
            style={{
              color: '#fff',
              fontSize: '2rem',
              fontWeight: 900,
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            Volunteers
          </h1>
        </div>
        <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>
          {volunteers.length} volunteer{volunteers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {error && (
        <p
          style={{
            color: '#ef9a9a',
            background: '#2a0a0a',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: '1rem',
          }}
        >
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ color: '#666' }}>Loading volunteers…</p>
      ) : (
        <div className="ag-theme-quartz-dark" style={{ flex: 1, minHeight: 400 }}>
          <AgGridReact
            rowData={volunteers}
            columnDefs={colDefs}
            defaultColDef={{ resizable: true }}
            onCellValueChanged={handleCellEdit}
            pagination={true}
            paginationPageSize={25}
            rowHeight={40}
            stopEditingWhenCellsLoseFocus={true}
            paginationPageSizeSelector={[25, 50, 100]}
          />
        </div>
      )}
    </div>
  )
}
