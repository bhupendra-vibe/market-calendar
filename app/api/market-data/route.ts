import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return Response.json({ data: [] })
    }

    // Create Supabase client on server (backend)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ data: [] })
    }

    return Response.json({ data: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ data: [] })
  }
}