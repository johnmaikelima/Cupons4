import mongoose from 'mongoose';

// Interface para os preços em diferentes lojas
interface StorePrice {
  storeName: string;
  price: number;
  url: string;
  lastUpdate: Date;
}

// Schema para os preços em diferentes lojas
const StorePriceSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  price: { type: Number, required: true },
  url: { type: String, required: true },
  lastUpdate: { type: Date, default: Date.now }
});

// Schema principal do produto
const ComparisonProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  images: [String],
  description: { type: String },
  technicalSpecs: { type: Map, of: String }, // Características técnicas como chave-valor
  ean: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true },
  prices: [StorePriceSchema], // Array de preços em diferentes lojas
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Índices para melhorar a performance das buscas
ComparisonProductSchema.index({ name: 'text', description: 'text' });
ComparisonProductSchema.index({ category: 1 });

// Middleware para atualizar o updatedAt
ComparisonProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Interface do produto para TypeScript
export interface IComparisonProduct {
  _id?: string;
  name: string;
  slug: string;
  images: string[];
  description?: string;
  technicalSpecs?: Map<string, string>;
  ean: string;
  category: string;
  prices: {
    storeName: string;
    price: number;
    url: string;
    lastUpdate: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Criar ou recuperar o modelo
export const ComparisonProduct = mongoose.models.ComparisonProduct || 
  mongoose.model('ComparisonProduct', ComparisonProductSchema);
