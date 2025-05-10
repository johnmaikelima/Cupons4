import mongoose from 'mongoose';

export interface Api {
  name: string;
  provider: 'awin' | 'lomadee';
  apiKey?: string;
  publisherId?: string;
  currency?: string;
  appToken?: string;
  sourceId?: string;
  baseUrl?: string;
  lastSync?: Date | null;
  active: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const apiSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  provider: { 
    type: String, 
    required: true,
    enum: ['awin', 'lomadee'],
    trim: true,
    lowercase: true
  },
  apiKey: { type: String, trim: true },
  publisherId: { type: String, trim: true },
  currency: { 
    type: String, 
    enum: ['BRL', 'EUR', 'GBP', 'USD'],
    trim: true,
    uppercase: true
  },
  appToken: { type: String, trim: true },
  sourceId: { type: String, trim: true },
  baseUrl: { type: String, trim: true },
  lastSync: { type: Date },
  active: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  versionKey: false
});

// Validação condicional baseada no provider
apiSchema.pre('validate', function(next) {
  if (this.provider === 'awin') {
    if (!this.apiKey || !this.publisherId || !this.currency) {
      next(new Error('API Key, Publisher ID e Currency são obrigatórios para APIs da Awin'));
      return;
    }
  } else if (this.provider === 'lomadee') {
    if (!this.appToken || !this.sourceId || !this.baseUrl) {
      next(new Error('App Token, Source ID e Base URL são obrigatórios para APIs da Lomadee'));
      return;
    }
  }
  next();
});

// Índices
apiSchema.index({ provider: 1 });
apiSchema.index({ name: 1 }, { unique: true });
apiSchema.index({ active: 1 });
apiSchema.index({ isActive: 1 });
apiSchema.index({ lastSync: 1 });

// Remover modelo existente se houver
if (mongoose.models.Api) {
  delete mongoose.models.Api;
}

// Criar novo modelo
export const Api = mongoose.model('Api', apiSchema);
