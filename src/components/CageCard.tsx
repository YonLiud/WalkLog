'use client'

import { useState, useRef, useEffect } from 'react'
import { type CageRecord } from '@/lib/supabase'
import { cageService } from '@/lib/cageService'

interface CageCardProps {
  cage: CageRecord
  onStateChange: (id: number, newState: 0 | 1 | 2) => void
  onNotesChange: (id: number, notes: string) => void
}

const STATE_LABELS = {
  0: 'Not yet',
  1: 'Walked',
  2: 'Do not walk'
} as const

const STATE_COLORS = {
  0: 'bg-gray-200 text-gray-800 border-gray-300',
  1: 'bg-green-200 text-green-800 border-green-300',
  2: 'bg-red-200 text-red-800 border-red-300'
} as const

export default function CageCard({ cage, onStateChange, onNotesChange }: CageCardProps) {
  const [notes, setNotes] = useState(cage.notes || '')
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setNotes(cage.notes || '')
    
    // Flash effect when cage data changes (from live updates)
    setIsUpdating(true)
    const timer = setTimeout(() => setIsUpdating(false), 300)
    
    return () => clearTimeout(timer)
  }, [cage.notes, cage.state])

  const handleStateClick = () => {
    const nextState = ((cage.state + 1) % 3) as 0 | 1 | 2
    onStateChange(cage.id, nextState)
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes)
    
    // Clear existing timeout
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current)
    }

    // Set new timeout to save notes after user stops typing
    notesTimeoutRef.current = setTimeout(() => {
      onNotesChange(cage.id, newNotes)
    }, 500) // Save 500ms after user stops typing
  }

  const handleNotesBlur = () => {
    // Save immediately when user leaves the input
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current)
    }
    onNotesChange(cage.id, notes)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 overflow-hidden transition-all duration-300 ${isUpdating ? 'ring-2 ring-blue-400 ring-opacity-75' : ''}`}>
      {/* Main cage state button */}
      <button
        onClick={handleStateClick}
        className={`w-full p-4 text-left transition-colors duration-200 border-2 ${STATE_COLORS[cage.state]} hover:opacity-80 active:scale-95`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">
              {cage.cell_side}
            </h3>
            {/* <p className="text-sm opacity-75">
              {cage.cell_side}
            </p> */}
          </div>
          <div className="text-right">
            <span className="font-medium">
              {STATE_LABELS[cage.state]}
            </span>
          </div>
        </div>
      </button>

      {/* Notes section */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          className="w-full p-3 text-left text-sm text-gray-600 hover:bg-gray-50 flex justify-between items-center"
        >
          <span className={`transform transition-transform ${isNotesExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {isNotesExpanded && (
          <div className="p-3 border-t border-gray-100">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes for this cage..."
              className="w-full min-h-[80px] p-2 border border-gray-300 rounded resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {notes.length}/500
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
