import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cluthxncoaeslzdbxzyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdXRoeG5jb2Flc2x6ZGJ4enl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MjY0MzQsImV4cCI6MjA2NTAwMjQzNH0.R3Vsxo9pxtBi6cXFSqiSTQlXc4CiuKIlsUUHzh5m5z4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
