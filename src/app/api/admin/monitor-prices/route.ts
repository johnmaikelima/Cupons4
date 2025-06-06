import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Iniciar o script em background
    const command = 'start /B node scripts/check-prices-final.js';
    await execAsync(command, { cwd: process.cwd() });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao iniciar monitoramento:', error);
    return NextResponse.json(
      { error: 'Falha ao iniciar monitoramento' },
      { status: 500 }
    );
  }
}
