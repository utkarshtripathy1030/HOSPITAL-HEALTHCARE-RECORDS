import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, age, symptoms } = await req.json();
    
    console.log('Analyzing symptoms for:', { name, age, symptoms });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a medical assistant AI that analyzes patient symptoms and provides preliminary health assessments. 
    
IMPORTANT: You are NOT providing medical diagnosis or treatment. You are providing educational information only.

For each patient analysis, provide:
1. A possible condition or health concern based on symptoms (clearly state this is NOT a medical diagnosis)
2. 3-5 practical health tips and recommendations
3. Advice to seek professional medical care when appropriate

Format your response as JSON with this structure:
{
  "diagnosis": "Brief description of possible condition (1-2 sentences)",
  "recommendations": "Detailed health tips and recommendations (3-5 bullet points as a single formatted string)"
}

Keep the tone professional, empathetic, and clear. Always remind that this is preliminary information and professional medical consultation is important.`;

    const userPrompt = `Patient Information:
- Name: ${name}
- Age: ${age}
- Symptoms: ${symptoms}

Please analyze these symptoms and provide health guidance.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service unavailable. Please contact support.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response received');
    
    const aiResponse = data.choices[0].message.content;
    
    // Try to parse JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: create structured response from plain text
      analysis = {
        diagnosis: aiResponse.split('\n')[0] || 'Unable to analyze symptoms',
        recommendations: aiResponse
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-symptoms function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during analysis';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});