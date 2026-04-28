import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://jwxaxeakzjherdwldfqt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eGF4ZWFrempoZXJkd2xkZnF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDY4ODMsImV4cCI6MjA5MjYyMjg4M30.0DcQoLRjtMPpbWmaVwAQJBBv42F1XJXMSStIbqDOphY'
  )
}