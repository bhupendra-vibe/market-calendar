import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return Response.json(
        { error: 'Missing start or end date' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .eq('session', 'cash')
      .order('date', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return Response.json({ data: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { data: [] },
      { status: 200 }
    )
  }
}