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

type LeaderboardSong = {
  rank: number
  songId: number
  originalFilename: string
  likes: number
  dislikes: number
  total: number
  score: number
}

type GroupLeaderboard = {
  groupId: number
  groupName: string
  round: number
  songs: LeaderboardSong[]
  totalVotes: number
  totalListeners: number
  completionPct: number
  listeners: {
    listenerId: number
    name: string
    email: string
    totalSongs: number
    votedSongs: number
    pct: number
  }[]
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ok ? '#4caf50' : '#e63946',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: ok ? '#4caf50' : '#e63946',
          fontFamily: "'Courier New', monospace",
          fontSize: '0.75rem',
        }}
      >
        {ok ? 'Ready' : 'Not Ready'}
      </span>
    </div>
  )
}

function ControlRow({
  label,
  value,
  status,
  children,
}: {
  label: string
  value?: string | number
  status?: boolean
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div>
        <p
          style={{
            color: '#aaa',
            fontFamily: "'Courier New', monospace",
            fontSize: '0.8rem',
            margin: 0,
          }}
        >
          {label}
        </p>
        {value !== undefined && (
          <p
            style={{
              color: '#fff',
              fontFamily: 'Georgia, serif',
              fontSize: '1.1rem',
              margin: '2px 0 0',
              fontWeight: 700,
            }}
          >
            {value}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {status !== undefined && <StatusDot ok={status} />}
        {children}
      </div>
    </div>
  )
}

export default function ListeningDashboard() {
  const [activeTab, setActiveTab] = useState<'members' | 'leaderboard' | 'controls'>('members')
  const [listeners, setListeners] = useState<Listener[]>([])
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<GroupLeaderboard[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [settings, setSettings] = useState<{
    year?: number
    startDate?: string
    endDate?: string
    isOpen?: boolean
  } | null>(null)
  const [settingsForm, setSettingsForm] = useState({ year: '', startDate: '', endDate: '' })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [assigningGroups, setAssigningGroups] = useState(false)
  const [assignResult, setAssignResult] = useState<any>(null)
  const [round2Preview, setRound2Preview] = useState<any>(null)
  const [round2Loading, setRound2Loading] = useState(false)
  const [round2Launching, setRound2Launching] = useState(false)
  const [round2Result, setRound2Result] = useState<any>(null)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/listening-committee-settings')
      const data = await res.json()
      setSettings(data)
      setSettingsForm({
        year: data.year?.toString() ?? '',
        startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
      })
    } catch (e) {
      console.error('Failed to fetch settings', e)
    }
  }, [])

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

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true)
    try {
      const res = await fetch('/api/listening-leaderboard')
      const data = await res.json()
      setLeaderboard(data.groups ?? [])
    } catch (e) {
      console.error('Failed to fetch leaderboard', e)
    } finally {
      setLeaderboardLoading(false)
    }
  }, [])

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true)
    try {
      const res = await fetch('/api/lc-controls/status')
      const data = await res.json()
      setStatus(data)
    } catch (e) {
      console.error('Failed to fetch status', e)
    } finally {
      setStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListeners()
    fetchSettings()
  }, [fetchListeners, fetchSettings])

  useEffect(() => {
    if (activeTab === 'leaderboard' && leaderboard.length === 0) fetchLeaderboard()
    if (activeTab === 'controls' && !status) fetchStatus()
  }, [activeTab])

  async function handleSettingsSave() {
    setSettingsSaving(true)
    setSettingsSuccess(false)
    try {
      await fetch('/api/listening-committee-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: settingsForm.year ? Number(settingsForm.year) : undefined,
          startDate: settingsForm.startDate || undefined,
          endDate: settingsForm.endDate || undefined,
        }),
      })
      await fetchSettings()
      setSettingsSuccess(true)
      setTimeout(() => setSettingsSuccess(false), 3000)
    } catch (e) {
      console.error('Failed to save settings', e)
    } finally {
      setSettingsSaving(false)
    }
  }

  async function handleCellEdit(event: { data: Listener }) {
    const { data } = event
    try {
      await fetch(`/api/listening-list/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: data.status, assignedBatch: data.assignedBatch }),
      })
    } catch (e) {
      console.error('Failed to update listener', e)
    }
  }
  async function handleLoadUsers() {
    try {
      const res = await fetch('/api/lc-controls/seed-users', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await fetchStatus()
      } else {
        console.error('Seed failed:', data.error)
      }
    } catch (e) {
      console.error('Failed to seed users', e)
    }
  }

  async function handleAssignGroups() {
    setAssigningGroups(true)
    setAssignResult(null)
    try {
      const res = await fetch('/api/lc-controls/assign-groups', { method: 'POST' })
      const data = await res.json()
      setAssignResult(data)
      await fetchStatus()
    } catch (e) {
      console.error('Failed to assign groups', e)
    } finally {
      setAssigningGroups(false)
    }
  }
  async function handleAssignRound2Groups() {
    setAssigningGroups(true)
    setAssignResult(null)
    try {
      const res = await fetch('/api/lc-controls/round2-launch', { method: 'POST' })
      const data = await res.json()
      setRound2Result(data)
      await fetchStatus()
    } catch (e) {
      console.error('Failed to assign round 2 groups', e)
    } finally {
      setAssigningGroups(false)
    }
  }

  async function handleRound2Preview() {
    console.log('[round2] fetching preview...')
    setRound2Loading(true)
    try {
      const res = await fetch('/api/lc-controls/round2-preview')
      const data = await res.json()
      console.log('[round2] preview data:', data)
      setRound2Preview(data)
    } catch (e) {
      console.error('Failed to load round 2 preview', e)
    } finally {
      setRound2Loading(false)
    }
  }

  async function handleRound2Launch() {
    setRound2Launching(true)
    setRound2Result(null)
    try {
      const res = await fetch('/api/lc-controls/round2-launch', { method: 'POST' })
      const data = await res.json()
      setRound2Result(data)
      setRound2Preview(null)
      await fetchStatus()
    } catch (e) {
      console.error('Failed to launch round 2', e)
    } finally {
      setRound2Launching(false)
    }
  }

  function btn(
    label: string,
    onClick: () => void,
    disabled = false,
    color = '#e63946',
  ): React.ReactNode {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          background: disabled ? '#333' : color,
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 16px',
          fontSize: '0.8rem',
          fontFamily: "'Courier New', monospace",
          cursor: disabled ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </button>
    )
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
      {/* Header */}
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 4px', color: '#e8e8e8' }}>
            Listening Committee
          </h1>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
            {listeners.length} member{listeners.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Campaign settings */}
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: 8,
          padding: '1rem 1.25rem',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <p
            style={{
              color: '#ff8c42',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: "'Courier New', monospace",
              margin: 0,
              flexShrink: 0,
            }}
          >
            Sign Up form deploy
          </p>
          <input
            type="datetime-local"
            value={settingsForm.startDate}
            onChange={(e) => setSettingsForm({ ...settingsForm, startDate: e.target.value })}
            style={settingsInputStyle}
          />
          <input
            type="datetime-local"
            value={settingsForm.endDate}
            onChange={(e) => setSettingsForm({ ...settingsForm, endDate: e.target.value })}
            style={settingsInputStyle}
          />
          <button
            onClick={handleSettingsSave}
            disabled={settingsSaving}
            style={{
              background: '#e63946',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 16px',
              fontSize: '0.85rem',
              fontFamily: "'Courier New', monospace",
              cursor: 'pointer',
            }}
          >
            {settingsSaving ? 'Saving…' : 'Save →'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: settings?.isOpen ? '#4caf50' : '#ef9a9a',
              }}
            />
            <span
              style={{
                color: settings?.isOpen ? '#4caf50' : '#ef9a9a',
                fontSize: '0.75rem',
                fontFamily: "'Courier New', monospace",
              }}
            >
              {settings?.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          {settingsSuccess && (
            <span
              style={{
                color: '#a5d6a7',
                fontSize: '0.8rem',
                fontFamily: "'Courier New', monospace",
              }}
            >
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {(['members', 'leaderboard', 'controls'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #e63946' : '2px solid transparent',
              color: activeTab === tab ? '#fff' : '#666',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Members tab */}
      {activeTab === 'members' &&
        (loading ? (
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
        ))}

      {/* Leaderboard tab */}
      {activeTab === 'leaderboard' &&
        (leaderboardLoading ? (
          <p style={{ color: '#666' }}>Loading leaderboard…</p>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
            {[1, 2].map((round) => {
              const roundGroups = leaderboard.filter((g) => g.round === round)
              if (roundGroups.length === 0) return null
              return (
                <div key={round} style={{ marginBottom: '2rem' }}>
                  <h2
                    style={{
                      color: '#ff8c42',
                      fontFamily: "'Courier New', monospace",
                      fontSize: '0.75rem',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      margin: '0 0 1rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid rgba(255,140,66,0.2)',
                    }}
                  >
                    {round === 1 ? '⓵ Round 1 — Group Stage' : '⓶ Round 2 — Finals'}
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                      gap: '1.5rem',
                    }}
                  >
                    {roundGroups.map((group) => (
                      <div
                        key={group.groupId}
                        style={{
                          background: '#1a1a2e',
                          borderRadius: 12,
                          padding: '1.25rem',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                          }}
                        >
                          <h2
                            style={{
                              color: '#ff8c42',
                              fontFamily: "'Courier New', monospace",
                              fontSize: '0.75rem',
                              letterSpacing: '0.2em',
                              textTransform: 'uppercase',
                              margin: 0,
                            }}
                          >
                            {group.groupName}
                          </h2>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <span
                              style={{
                                color: '#555',
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.7rem',
                              }}
                            >
                              {group.totalListeners} listeners
                            </span>
                            <span
                              style={{
                                color: group.completionPct === 100 ? '#4caf50' : '#ffb300',
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.7rem',
                              }}
                            >
                              {group.completionPct}% complete
                            </span>
                          </div>
                        </div>
                        {group.songs.map((song, i) => (
                          <div
                            key={song.songId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.5rem 0',
                              borderBottom:
                                i < group.songs.length - 1
                                  ? '1px solid rgba(255,255,255,0.04)'
                                  : 'none',
                            }}
                          >
                            <span
                              style={{
                                color:
                                  i === 0
                                    ? '#ffd700'
                                    : i === 1
                                      ? '#c0c0c0'
                                      : i === 2
                                        ? '#cd7f32'
                                        : '#555',
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.75rem',
                                width: 20,
                                textAlign: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {i === 0 ? '①' : i === 1 ? '②' : i === 2 ? '③' : i === 3 ? '④' : '⑤'}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  color: '#e8e8e8',
                                  fontFamily: 'Georgia, serif',
                                  fontSize: '0.85rem',
                                  margin: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {song.originalFilename.replace(/\.[^/.]+$/, '')}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                              <span
                                style={{
                                  color: '#4caf50',
                                  fontFamily: "'Courier New', monospace",
                                  fontSize: '0.75rem',
                                }}
                              >
                                👍 {song.likes}
                              </span>
                              <span
                                style={{
                                  color: '#e63946',
                                  fontFamily: "'Courier New', monospace",
                                  fontSize: '0.75rem',
                                }}
                              >
                                👎 {song.dislikes}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div
                          style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <p
                            style={{
                              color: '#555',
                              fontFamily: "'Courier New', monospace",
                              fontSize: '0.65rem',
                              letterSpacing: '0.15em',
                              textTransform: 'uppercase',
                              margin: '0 0 0.5rem',
                            }}
                          >
                            Voter Progress
                          </p>
                          {group.listeners.every((l) => l.votedSongs === 0) ? (
                            <p
                              style={{
                                color: '#444',
                                fontFamily: "'Courier New', monospace",
                                fontSize: '0.75rem',
                                margin: 0,
                                fontStyle: 'italic',
                              }}
                            >
                              No votes cast yet
                            </p>
                          ) : (
                            group.listeners.map((listener) => (
                              <div
                                key={listener.listenerId}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginBottom: '0.35rem',
                                }}
                              >
                                <span
                                  style={{
                                    color: '#aaa',
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '0.7rem',
                                    width: 120,
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {listener.name}
                                </span>
                                <div
                                  style={{
                                    flex: 1,
                                    height: 4,
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 99,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${listener.pct}%`,
                                      background:
                                        listener.pct === 100
                                          ? '#4caf50'
                                          : listener.pct > 50
                                            ? '#ffb300'
                                            : '#e63946',
                                      borderRadius: 99,
                                      transition: 'width 0.3s ease',
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    color: listener.pct === 100 ? '#4caf50' : '#666',
                                    fontFamily: "'Courier New', monospace",
                                    fontSize: '0.65rem',
                                    width: 32,
                                    textAlign: 'right',
                                    flexShrink: 0,
                                  }}
                                >
                                  {listener.votedSongs}/{listener.totalSongs}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* Controls tab */}
      {activeTab === 'controls' && (
        <div style={{ flex: 1, overflowY: 'auto', maxWidth: 680 }}>
          {statusLoading ? (
            <p
              style={{ color: '#666', fontFamily: "'Courier New', monospace", fontSize: '0.85rem' }}
            >
              Checking status…
            </p>
          ) : (
            <>
              {/* Phase 1 — Songs */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Phase 1 — Songs</p>
                <ControlRow label="Songs in B2 bucket" value={status?.b2SongCount ?? '—'}>
                  {btn('Load Songs', () => {}, false, '#555')}
                </ControlRow>
                <ControlRow
                  label="Songs loaded in app"
                  value={status?.songsInApp ?? '—'}
                  status={status?.songsInApp > 0}
                />
                <ControlRow
                  label="Waveform peaks generated"
                  value={status ? `${status.peaksGenerated} / ${status.songsInApp}` : '—'}
                  status={
                    status?.peaksGenerated > 0 && status?.peaksGenerated === status?.songsInApp
                  }
                />
                <ControlRow label="Ready" status={status?.songsInApp > 0} />
              </div>

              {/* Phase 1 — Listeners */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Phase 1 — Listeners</p>
                <ControlRow
                  label="Active listener profiles"
                  value={status?.activeListeners ?? '—'}
                  status={status?.activeListeners > 0}
                >
                  {btn('Load Users', () => {}, false, '#555')}
                </ControlRow>
                <ControlRow
                  label="Listeners assigned to groups"
                  value={status?.listenersInGroups ?? '—'}
                  status={status?.listenersInGroups > 0}
                />
              </div>

              {/* Phase 1 — Groups */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Phase 1 — Groups</p>
                <ControlRow
                  label="Groups assigned"
                  value={
                    status ? `${status.groupCount} groups — ${status.songsAssigned} songs` : '—'
                  }
                  status={status?.groupCount > 0}
                >
                  {btn(
                    assigningGroups ? 'Assigning…' : 'Assign Groups',
                    handleAssignGroups,
                    assigningGroups,
                  )}
                </ControlRow>
                {assignResult && (
                  <div style={successBox}>
                    <p
                      style={{
                        color: '#4caf50',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.75rem',
                        margin: 0,
                      }}
                    >
                      ✓ {assignResult.groups?.length} groups assigned
                    </p>
                  </div>
                )}
              </div>

              {/* Round 1 */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Round 1</p>
                <ControlRow label="Start Round 1">
                  {btn('Start Round 1', () => {}, status?.groupCount === 0)}
                </ControlRow>
                <ControlRow
                  label="Round 1 winners"
                  value={
                    status?.round2Exists
                      ? 'Loaded'
                      : status?.round1Complete
                        ? 'Ready to preview'
                        : 'Pending round 1'
                  }
                  status={status?.round2Exists || status?.round1Complete}
                />
                <ControlRow
                  label="Round 1 status"
                  value={status?.round1Complete ? 'Voting complete' : 'Voting in progress'}
                  status={status?.round1Complete}
                />
                <ControlRow
                  label="Total votes cast"
                  value={status?.totalVotes ?? '—'}
                  status={status?.totalVotes > 0}
                />
                <ControlRow label="Collect Reports">
                  {btn(
                    'Collect Reports',
                    () => window.open('/api/lc-controls/report?round=1', '_blank'),
                    status?.totalVotes === 0,
                  )}
                </ControlRow>
              </div>

              {/* Phase 2 — Songs */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Phase 2 — Songs</p>
                <ControlRow
                  label="Round 2 winners"
                  value={
                    status?.round2Exists
                      ? 'Loaded'
                      : status?.round1Complete
                        ? 'Ready to preview'
                        : 'Pending round 1'
                  }
                />
                <ControlRow label="Preview Round 2 songs">
                  {!round2Preview &&
                    !round2Result &&
                    btn(
                      round2Loading ? 'Loading…' : 'Preview Songs',
                      handleRound2Preview,
                      round2Loading || status?.totalVotes === 0,
                      '#555',
                    )}
                </ControlRow>
                {round2Preview && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: 'rgba(255,140,66,0.06)',
                      borderRadius: 8,
                      border: '1px solid rgba(255,140,66,0.2)',
                    }}
                  >
                    <p
                      style={{
                        color: '#ff8c42',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.75rem',
                        margin: '0 0 0.75rem',
                      }}
                    >
                      {round2Preview.totalWinners} songs advancing to Round 2
                    </p>
                    <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: '0.75rem' }}>
                      {round2Preview.songs?.map((song: any) => (
                        <div
                          key={song.songId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.25rem 0',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <span
                            style={{
                              color: '#e8e8e8',
                              fontFamily: 'Georgia, serif',
                              fontSize: '0.8rem',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {song.originalFilename.replace(/\.[^/.]+$/, '')}
                          </span>
                          <span
                            style={{
                              color: '#555',
                              fontFamily: "'Courier New', monospace",
                              fontSize: '0.7rem',
                              flexShrink: 0,
                              marginLeft: '0.5rem',
                            }}
                          >
                            {song.fromGroup} #{song.rank} · 👍{song.likes}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {btn('Cancel', () => setRound2Preview(null), false, '#555')}
                    </div>
                  </div>
                )}
              </div>

              {/* Phase 2 — Listeners */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Phase 2 — Listeners</p>
                <ControlRow
                  label="Active listener profiles"
                  value={status?.activeListeners ?? '—'}
                  status={status?.activeListeners > 0}
                />
                <ControlRow
                  label="Listeners assigned to Round 2 groups"
                  value={
                    status?.round2Exists
                      ? String(status?.listenersInGroups)
                      : status?.round1Complete
                        ? 'Auto-assigned on Round 2 launch'
                        : 'Pending round 1'
                  }
                  status={status?.round2Exists || status?.round1Complete}
                />
              </div>

              {/* Phase 2 — Groups */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Phase 2 — Groups</p>
                <ControlRow
                  label="Round 2 groups"
                  value={
                    status?.round2Exists
                      ? 'Assigned'
                      : status?.round1Complete
                        ? 'Auto-assigned on Round 2 launch'
                        : 'Pending round 1'
                  }
                  status={status?.round2Exists || status?.round1Complete}
                />
              </div>

              {/* Round 2 */}
              <div style={sectionStyle}>
                <p style={sectionLabel}>Round 2</p>
                <ControlRow label="Start Round 2">
                  {btn(
                    round2Launching ? 'Launching…' : 'Start Round 2',
                    handleRound2Launch,
                    round2Launching || !status?.round1Complete,
                    '#4caf50',
                  )}
                </ControlRow>
                <ControlRow
                  label="Total votes cast"
                  value={status?.round2Exists ? '—' : 'Pending'}
                  status={status?.round2Exists}
                />
                {btn(
                  'Collect Reports',
                  () => window.open('/api/lc-controls/report?round=2', '_blank'),
                  !status?.round2Exists,
                )}
                {round2Result && (
                  <div style={successBox}>
                    <p
                      style={{
                        color: '#4caf50',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '0.75rem',
                        margin: 0,
                      }}
                    >
                      ✓ Round 2 launched — {round2Result.totalWinners} songs in{' '}
                      {round2Result.groups?.length} groups
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={fetchStatus}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#666',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontSize: '0.8rem',
                  fontFamily: "'Courier New', monospace",
                  cursor: 'pointer',
                  marginBottom: '2rem',
                }}
              >
                ↻ Refresh Status
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const settingsInputStyle: React.CSSProperties = {
  background: '#0f0f1a',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: '0.85rem',
  fontFamily: "'Courier New', monospace",
}

const sectionStyle: React.CSSProperties = {
  background: '#1a1a2e',
  borderRadius: 12,
  padding: '1.25rem',
  border: '1px solid rgba(255,255,255,0.08)',
  marginBottom: '1rem',
}

const sectionLabel: React.CSSProperties = {
  color: '#ff8c42',
  fontFamily: "'Courier New', monospace",
  fontSize: '0.7rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  margin: '0 0 0.5rem',
}

const successBox: React.CSSProperties = {
  marginTop: '0.75rem',
  padding: '0.75rem',
  background: 'rgba(76,175,80,0.08)',
  borderRadius: 8,
  border: '1px solid rgba(76,175,80,0.2)',
}
