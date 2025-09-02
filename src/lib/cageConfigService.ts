import { supabase, type CageRecord } from './supabase'

export type CageConfiguration = {
  cage_num: number
  is_split: boolean // true = Inner/Outer, false = Combined
  created_at?: string
  updated_at?: string
}

export const cageConfigService = {
  // Get all cage configurations
  async getAllConfigurations(): Promise<CageConfiguration[]> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data, error } = await supabase
      .from('cage_configurations')
      .select('*')
      .order('cage_num', { ascending: true })

    if (error) {
      console.error('Error fetching cage configurations:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  },

  // Update cage configuration (split vs combined)
  async updateConfiguration(cage_num: number, is_split: boolean): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const { error: upsertError } = await supabase
      .from('cage_configurations')
      .upsert({
        cage_num,
        is_split,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('Error updating cage configuration:', upsertError)
      throw new Error(`Database error: ${upsertError.message}`)
    }

    // Now we need to update the actual cage records
    if (is_split) {
      // Ensure we have both Inner and Outer records
      await this.ensureSplitCage(cage_num)
    } else {
      // Convert to combined cage (remove Inner/Outer, add Both)
      await this.ensureCombinedCage(cage_num)
    }
  },

  // Ensure a cage is split (has Inner and Outer records)
  async ensureSplitCage(cage_num: number): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    // Check what records currently exist
    const { data: existing } = await supabase
      .from('cages')
      .select('*')
      .eq('cage_num', cage_num)

    const hasInner = existing?.some(c => c.cell_side === 'Inner')
    const hasOuter = existing?.some(c => c.cell_side === 'Outer')
    const hasBoth = existing?.some(c => c.cell_side === 'Both')

    // If we have a "Both" record, convert it to Inner and Outer
    if (hasBoth && existing) {
      const bothRecord = existing.find(c => c.cell_side === 'Both')
      
      if (bothRecord) {
        // Delete the "Both" record
        await supabase
          .from('cages')
          .delete()
          .eq('id', bothRecord.id)

        // Create Inner and Outer records with the same state
        const records = [
          { cage_num, cell_side: 'Inner', state: bothRecord.state, notes: bothRecord.notes },
          { cage_num, cell_side: 'Outer', state: bothRecord.state, notes: bothRecord.notes }
        ]

        await supabase
          .from('cages')
          .insert(records)
      }
    } else {
      // Create missing records
      const toCreate = []
      if (!hasInner) toCreate.push({ cage_num, cell_side: 'Inner', state: 0, notes: null })
      if (!hasOuter) toCreate.push({ cage_num, cell_side: 'Outer', state: 0, notes: null })

      if (toCreate.length > 0) {
        await supabase
          .from('cages')
          .insert(toCreate)
      }
    }
  },

  // Ensure a cage is combined (has only Both record)
  async ensureCombinedCage(cage_num: number): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    // Check what records currently exist
    const { data: existing } = await supabase
      .from('cages')
      .select('*')
      .eq('cage_num', cage_num)

    const innerRecord = existing?.find(c => c.cell_side === 'Inner')
    const outerRecord = existing?.find(c => c.cell_side === 'Outer')
    const bothRecord = existing?.find(c => c.cell_side === 'Both')

    if (!bothRecord && (innerRecord || outerRecord)) {
      // Determine the state for the combined record
      // Priority: if either is "Walked" (1), use that; otherwise use the first available state
      let combinedState = 0
      let combinedNotes = null

      if (innerRecord?.state === 1 || outerRecord?.state === 1) {
        combinedState = 1
      } else if (innerRecord?.state === 2 || outerRecord?.state === 2) {
        combinedState = 2
      } else {
        combinedState = innerRecord?.state || outerRecord?.state || 0
      }

      // Combine notes if they exist
      const notes = [innerRecord?.notes, outerRecord?.notes].filter(Boolean)
      if (notes.length > 0) {
        combinedNotes = notes.join('; ')
      }

      // Delete existing Inner/Outer records
      if (existing) {
        for (const record of existing) {
          await supabase
            .from('cages')
            .delete()
            .eq('id', record.id)
        }
      }

      // Create the combined record
      await supabase
        .from('cages')
        .insert({
          cage_num,
          cell_side: 'Both',
          state: combinedState,
          notes: combinedNotes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }
  },

  // Initialize default configurations for cages 1-21 (split by default)
  async initializeDefaultConfigurations(): Promise<void> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const defaultConfigs = Array.from({ length: 21 }, (_, i) => ({
      cage_num: i + 1,
      is_split: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
      .from('cage_configurations')
      .upsert(defaultConfigs, { onConflict: 'cage_num' })

    if (error) {
      console.error('Error initializing cage configurations:', error)
      throw new Error(`Database error: ${error.message}`)
    }
  }
}
