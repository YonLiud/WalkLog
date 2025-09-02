import { supabase, type CageRecord } from './supabase'

export const cageService = {
  // Get all cage records
  async getAllCages(): Promise<CageRecord[]> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data, error } = await supabase
      .from('cages')
      .select('*')
      .order('cage_num', { ascending: true })
      .order('cell_side', { ascending: true })

    if (error) {
      console.error('Error fetching cages:', error)
      
      // Provide helpful error messages for common issues
      if (error.message.includes('table') && error.message.includes('does not exist')) {
        throw new Error('Database table not found. Please run the setup SQL script in your Supabase dashboard.')
      }
      
      if (error.message.includes('schema cache')) {
        throw new Error('Database table "cages" not found. Please create the table using the SQL script in database/setup.sql')
      }
      
      throw new Error(`Database error: ${error.message}`)
    }

    return data || []
  },

  // Update cage state
  async updateCageState(id: number, state: 0 | 1 | 2): Promise<CageRecord> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data, error } = await supabase
      .from('cages')
      .update({ 
        state,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cage state:', error)
      throw error
    }

    return data
  },

  // Update cage notes
  async updateCageNotes(id: number, notes: string): Promise<CageRecord> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const { data, error } = await supabase
      .from('cages')
      .update({ 
        notes: notes.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cage notes:', error)
      throw error
    }

    return data
  },

  // Create or initialize cage records for a specific cage number
  async initializeCage(cageNum: number): Promise<CageRecord[]> {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const cellSides: ('Inner' | 'Outer')[] = ['Inner', 'Outer']
    const records: CageRecord[] = []

    for (const cellSide of cellSides) {
      const { data, error } = await supabase
        .from('cages')
        .insert({
          cage_num: cageNum,
          cell_side: cellSide,
          state: 0,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error(`Error creating cage ${cageNum} ${cellSide}:`, error)
        throw error
      }

      records.push(data)
    }

    return records
  },

  // Subscribe to real-time updates
  subscribeToUpdates(callback: (payload: any) => void) {
    if (!supabase) throw new Error('Supabase client is not initialized')

    const channel = supabase
      .channel('cages-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cages' 
        }, 
        (payload) => {
          console.log('Received real-time update:', payload)
          callback(payload)
        }
      )
      .subscribe((status) => {
        console.log('Supabase subscription status:', status)
      })

    return channel
  }
}
