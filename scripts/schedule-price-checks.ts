import { exec } from 'child_process';
import { join } from 'path';

// Função para executar o script de verificação
function runPriceCheck() {
  const scriptPath = join(__dirname, 'check-prices-and-notify.ts');
  console.log(`\n[${new Date().toLocaleString()}] Iniciando verificação de preços...`);
  
  exec(`npx ts-node -r tsconfig-paths/register ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao executar script: ${error}`);
      return;
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });
}

// Executar imediatamente na primeira vez
runPriceCheck();

// Agendar para executar a cada 1 hora
const INTERVAL = 60 * 60 * 1000; // 1 hora em milissegundos
setInterval(runPriceCheck, INTERVAL);

console.log('Agendador iniciado. Verificação de preços será executada a cada 1 hora.');
console.log('Pressione Ctrl+C para encerrar.');

// Manter o processo rodando
process.stdin.resume();
