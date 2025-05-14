import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cupons.vercel.app',
        'X-Title': 'Cupons - Artigos'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar artigo' },
      { status: 500 }
    );
  }
}
