import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')

    console.log('API called with:', { start, end })

    if (!start || !end) {
      return Response.json({ data: [] }, { status: 200 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials')
      return Response.json({ data: [] }, { status: 200 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true })

    console.log('Supabase query result:', { dataCount: data?.length, error })

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ data: [] }, { status: 200 })
    }

    return Response.json({ data: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Catch block error:', error)
    return Response.json({ data: [] }, { status: 200 })
  }
}