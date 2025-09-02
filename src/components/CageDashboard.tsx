'use client'

import { useState, useEffect } from 'react'
import { type CageRecord } from '@/lib/supabase'
import { cageService } from '@/lib/cageService'
import { cageConfigService, type CageConfiguration } from '@/lib/cageConfigService'
import CageCard from './CageCard'
import CageConfigManager from './CageConfigManager'

interface CagesByNumber {
  [cageNum: number]: CageRecord[]
}

export default function CageDashboard() {
  const [cages, setCages] = useState<CageRecord[]>([])
  const [configurations, setConfigurations] = useState<CageConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showConfigManager, setShowConfigManager] = useState(false)

  useEffect(() => {
    loadCages()
    
    console.log('Setting up real-time subscription...')
    
    // Subscribe to real-time updates
    const subscription = cageService.subscribeToUpdates((payload) => {
      console.log('Dashboard received real-time update:', payload)
      setIsConnected(true) // Mark as connected when we receive updates
      
      // Handle different types of database changes
      if (payload.eventType === 'INSERT') {
        console.log('Handling INSERT:', payload.new)
        // Add new cage to the list
        setCages(prevCages => [...prevCages, payload.new])
      } else if (payload.eventType === 'UPDATE') {
        console.log('Handling UPDATE:', payload.new)
        // Update specific cage in the list
        setCages(prevCages => 
          prevCages.map(cage => 
            cage.id === payload.new.id ? payload.new : cage
          )
        )
      } else if (payload.eventType === 'DELETE') {
        console.log('Handling DELETE:', payload.old)
        // Remove cage from the list
        setCages(prevCages => 
          prevCages.filter(cage => cage.id !== payload.old.id)
        )
      } else {
        console.log('Unknown event type, reloading all cages')
        // Fallback: reload all cages for unknown events
        loadCages()
      }
    })

    // Set connected status after subscription is set up
    setTimeout(() => {
      console.log('Checking if real-time is connected...')
      // Note: Real connection status depends on Supabase real-time being enabled
    }, 1000)

    return () => {
      console.log('Unsubscribing from real-time updates')
      subscription.unsubscribe()
      setIsConnected(false)
    }
  }, [])

  const loadCages = async () => {
    try {
      setError(null)
      const [cageData, configData] = await Promise.all([
        cageService.getAllCages(),
        cageConfigService.getAllConfigurations()
      ])
      setCages(cageData)
      setConfigurations(configData)
    } catch (err) {
      setError('Failed to load cages. Please check your database connection.')
      console.error('Error loading cages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStateChange = async (id: number, newState: 0 | 1 | 2) => {
    try {
      // Optimistically update the UI
      setCages(prevCages => 
        prevCages.map(cage => 
          cage.id === id ? { ...cage, state: newState } : cage
        )
      )
      
      // Update in database
      await cageService.updateCageState(id, newState)
    } catch (err) {
      console.error('Error updating cage state:', err)
      // Revert optimistic update on error
      loadCages()
    }
  }

  const handleNotesChange = async (id: number, notes: string) => {
    try {
      await cageService.updateCageNotes(id, notes)
      // Update local state
      setCages(prevCages => 
        prevCages.map(cage => 
          cage.id === id ? { ...cage, notes: notes.trim() || null } : cage
        )
      )
    } catch (err) {
      console.error('Error updating cage notes:', err)
    }
  }

  // Group cages by cage number
  const cagesByNumber = cages.reduce<CagesByNumber>((acc, cage) => {
    if (!acc[cage.cage_num]) {
      acc[cage.cage_num] = []
    }
    acc[cage.cage_num].push(cage)
    return acc
  }, {})

  // Sort cage numbers
  const sortedCageNumbers = Object.keys(cagesByNumber)
    .map(Number)
    .sort((a, b) => a - b)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const isSetupError = error.includes('table not found') || error.includes('schema cache') || error.includes('does not exist')
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-lg">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isSetupError ? 'Database Setup Required' : 'Connection Error'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {isSetupError && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to SQL Editor</li>
                <li>Copy and paste the SQL from <code className="bg-blue-100 px-1 rounded">database/setup.sql</code></li>
                <li>Run the SQL script to create the cages table</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}
          
          <button 
            onClick={loadCages}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Kennel Care Tracker</h1>
              <p className="text-sm text-gray-600 mt-1">
                Tap cages to cycle through: Not yet → Walked → Do not walk
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={isConnected ? 'text-green-600' : 'text-gray-500'}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              {/* Configuration button */}
              <button
                onClick={() => setShowConfigManager(true)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1"
              >
                <span>⚙️</span>
                <span>Config</span>
              </button>
              
              {/* Test button for real-time */}
              <button
                onClick={async () => {
                  console.log('Testing real-time by updating first cage...')
                  const firstCage = cages[0]
                  if (firstCage) {
                    const newState = ((firstCage.state + 1) % 3) as 0 | 1 | 2
                    await handleStateChange(firstCage.id, newState)
                  }
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                Test
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {sortedCageNumbers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No cages found</p>
            <p className="text-gray-400 text-sm mt-2">
              Add cage records to your database to get started
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedCageNumbers.map(cageNum => (
              <div key={cageNum} className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-700 px-1">
                  Cage {cageNum}
                </h2>
                <div className="space-y-2">
                  {cagesByNumber[cageNum]
                    .sort((a, b) => a.cell_side.localeCompare(b.cell_side))
                    .map(cage => (
                    <CageCard
                      key={cage.id}
                      cage={cage}
                      onStateChange={handleStateChange}
                      onNotesChange={handleNotesChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer with stats */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <span>
              Total: {cages.length} cells
            </span>
            <span>
              Walked: {cages.filter(c => c.state === 1).length}
            </span>
            <span>
              Pending: {cages.filter(c => c.state === 0).length}
            </span>
            <span>
              Skip: {cages.filter(c => c.state === 2).length}
            </span>
          </div>
        </div>
      </footer>

      {/* Configuration Manager Modal */}
      <CageConfigManager
        isOpen={showConfigManager}
        onClose={() => setShowConfigManager(false)}
        onConfigurationChange={loadCages}
      />
    </div>
  )
}
