'use client'

import { useState, useEffect } from 'react'
import { cageConfigService, type CageConfiguration } from '@/lib/cageConfigService'

interface CageConfigManagerProps {
  isOpen: boolean
  onClose: () => void
  onConfigurationChange: () => void
}

export default function CageConfigManager({ isOpen, onClose, onConfigurationChange }: CageConfigManagerProps) {
  const [configurations, setConfigurations] = useState<CageConfiguration[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadConfigurations()
    }
  }, [isOpen])

  const loadConfigurations = async () => {
    setLoading(true)
    try {
      const configs = await cageConfigService.getAllConfigurations()
      setConfigurations(configs)
    } catch (error) {
      console.error('Error loading configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCageConfiguration = async (cage_num: number, currentIsSplit: boolean) => {
    setSaving(cage_num)
    try {
      await cageConfigService.updateConfiguration(cage_num, !currentIsSplit)
      // Update local state
      setConfigurations(prev => 
        prev.map(config => 
          config.cage_num === cage_num 
            ? { ...config, is_split: !currentIsSplit }
            : config
        )
      )
      // Notify parent component to reload cages
      onConfigurationChange()
    } catch (error) {
      console.error('Error updating configuration:', error)
    } finally {
      setSaving(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Cage Configuration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Configure which cages are split (Inner/Outer) or combined (single cell)
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {configurations.map((config) => (
                <div
                  key={config.cage_num}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-800">
                      Cage {config.cage_num}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      config.is_split 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {config.is_split ? 'Split' : 'Combined'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {config.is_split 
                      ? 'Has Inner and Outer cells' 
                      : 'Single combined cell'
                    }
                  </p>

                  <button
                    onClick={() => toggleCageConfiguration(config.cage_num, config.is_split)}
                    disabled={saving === config.cage_num}
                    className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                      config.is_split
                        ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                    }`}
                  >
                    {saving === config.cage_num ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </span>
                    ) : config.is_split ? (
                      'Convert to Combined'
                    ) : (
                      'Convert to Split'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Split: {configurations.filter(c => c.is_split).length} | 
              Combined: {configurations.filter(c => !c.is_split).length}
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
