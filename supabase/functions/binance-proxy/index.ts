
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const symbol = url.searchParams.get('symbol');
    const interval = url.searchParams.get('interval');
    const limit = url.searchParams.get('limit');

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let binanceUrl = '';
    
    switch (endpoint) {
      case 'ticker':
        if (!symbol) {
          return new Response(
            JSON.stringify({ error: 'Missing symbol parameter for ticker' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const binanceSymbol = symbol.replace('/', '');
        binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`;
        break;
        
      case 'klines':
        if (!symbol) {
          return new Response(
            JSON.stringify({ error: 'Missing symbol parameter for klines' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const klineSymbol = symbol.replace('/', '');
        const klineInterval = interval || '1h';
        const klineLimit = limit || '100';
        binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${klineSymbol}&interval=${klineInterval}&limit=${klineLimit}`;
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Fetching from Binance: ${binanceUrl}`);
    
    const response = await fetch(binanceUrl, {
      headers: {
        'User-Agent': 'Trading-App/1.0'
      }
    });
    
    if (!response.ok) {
      console.error(`Binance API error: ${response.status} ${response.statusText}`);
      throw new Error(`Binance API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=10' // Cache for 10 seconds
        }
      }
    );
    
  } catch (error) {
    console.error('Binance proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch data from Binance',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
