
import { createClient } from '@supabase/supabase-js'

export type Letter = {
  id: string
  content: string[]
  theme: string
  created_at: string
}

// Use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kkickfespkriivcgaqqk.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8R8UT37NDS1v1lNOWmvaCA_33i0VmmT'

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function saveLetter(content: string[], theme: string) {
  const { data, error } = await supabase
    .from('letters')
    .insert([
      { content, theme },
    ])
    .select()
  
  if (error) {
    console.error('Error saving letter:', error)
    return null
  }
  return data
}

export async function getLetters() {
  const { data, error } = await supabase
    .from('letters')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching letters:', error)
    return []
  }
  return data as Letter[]
}
