'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface CsvUploaderProps {
  onUploadComplete: (products: any[]) => void;
  onError: (error: string) => void;
}

export default function CsvUploader({ onUploadComplete, onError }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      onError('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        setIsProcessing(false);
        
        console.log('Dados do CSV:', {
          headers: results.meta.fields,
          firstRow: results.data[0],
          totalRows: results.data.length
        });
        
        if (results.errors.length > 0) {
          const errorMessage = results.errors
            .map(err => `Linha ${err.row + 1}: ${err.message}`)
            .join('\n');
          onError(`Erros no arquivo CSV:\n${errorMessage}`);
          return;
        }

        // Verifica se tem as colunas necessárias
        const requiredColumns = ['product_name', 'ean', 'merchant_category', 'description', 'merchant_image_url'];
        const headers = Object.keys(results.data[0] || {});
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          onError(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}\n\nColunas encontradas: ${headers.join(', ')}`);
          return;
        }

        // Processa e valida os dados
        const validatedData = results.data.map((row: any, index: number) => {
          // Limpa e normaliza o EAN
          const rawEan = row.ean;
          let cleanEan = rawEan;
          if (typeof rawEan === 'number') {
            cleanEan = rawEan.toString();
          } else if (typeof rawEan === 'string') {
            cleanEan = rawEan.trim();
          }

          // Remove espaços e zeros à esquerda
          cleanEan = cleanEan?.toString().trim();

          const errors = [
            (!row.product_name?.toString().trim()) && 'Nome do produto é obrigatório',
            (!row.merchant_category?.toString().trim()) && 'Categoria é obrigatória'
          ].filter(Boolean);

          return {
            index,
            row,
            cleanEan,
            hasEan: !!cleanEan,
            errors,
            isValid: errors.length === 0
          };
        });

        // Separa produtos válidos e inválidos
        const validProducts = validatedData.filter(item => item.isValid && item.hasEan);
        const invalidProducts = validatedData.filter(item => !item.isValid);
        const skippedProducts = validatedData.filter(item => item.isValid && !item.hasEan);

        // Mostra resumo
        console.log('Resumo do processamento:', {
          total: results.data.length,
          validos: validProducts.length,
          invalidos: invalidProducts.length,
          semEan: skippedProducts.length
        });

        // Se tem produtos inválidos (excluindo os sem EAN), mostra erro
        if (invalidProducts.length > 0) {
          const errorMessage = invalidProducts
            .map(item => `Linha ${item.index + 2}: ${item.errors.join(', ')}`)
            .join('\n');
          onError(`Dados inválidos encontrados em ${invalidProducts.length} produtos:\n${errorMessage}\n\nResumo:\n` +
            `Total de produtos: ${results.data.length}\n` +
            `Válidos para cadastro: ${validProducts.length}\n` +
            `Inválidos (ignorados): ${invalidProducts.length}\n` +
            `Sem EAN (ignorados): ${skippedProducts.length}`);
          return;
        }

        // Filtra apenas produtos válidos com EAN
        const products = validatedData
          .filter(item => item.isValid && item.hasEan)
          .map(({ row }) => ({
            name: row.product_name?.toString().trim(),
            ean: row.ean?.toString().trim(),
            category: row.merchant_category?.toString().trim(),
            description: row.description?.toString().trim() || '',
            images: row.merchant_image_url ? [row.merchant_image_url.toString().trim()] : []
          }));

        onUploadComplete(products);
      },
      error: (error) => {
        setIsProcessing(false);
        onError('Erro ao processar o arquivo: ' + error.message);
      }
    });
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        <div className="text-gray-600">
          {isProcessing ? (
            'Processando arquivo...'
          ) : (
            <>
              Arraste um arquivo CSV aqui ou{' '}
              <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                selecione um arquivo
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </>
          )}
        </div>
        <div className="text-sm text-gray-500 space-y-1">
          <p>Formato esperado (CSV com cabeçalho):</p>
          <p>Colunas obrigatórias:</p>
          <ul className="list-disc list-inside">
            <li>product_name (Nome do produto)</li>
            <li>ean (Código EAN)</li>
            <li>merchant_category (Categoria)</li>
          </ul>
          <p>Colunas opcionais:</p>
          <ul className="list-disc list-inside">
            <li>description (Descrição)</li>
            <li>merchant_image_url (URL da imagem)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
