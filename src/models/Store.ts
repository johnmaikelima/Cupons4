import mongoose from 'mongoose';
import slugify from 'slugify';

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string;
  url?: string;
  description?: string;
  affiliateLink?: string;
  couponsCount?: number;
  provider?: string;
  externalId?: string;
  hasOffers?: boolean;
}

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, required: false },
  slug: { type: String, required: true, unique: true },
  url: { type: String },
  affiliateLink: { type: String, default: '' },
  description: { type: String, default: '' },
  provider: { type: String, enum: ['awin', 'lomadee', 'manual'], default: 'manual' },
  externalId: { type: String, default: null },
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  hasOffers: { type: Boolean, default: false },
  coupons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
storeSchema.index({ provider: 1 });
storeSchema.index({ externalId: 1, provider: 1 }, { unique: true, sparse: true });
storeSchema.index({ active: 1 });
storeSchema.index({ featured: 1 });
storeSchema.index({ hasOffers: 1 });

// Gera slug único antes de salvar
storeSchema.pre('save', async function(next) {
  try {
    if (!this.slug) {
      // Gera o slug base
      let baseSlug = slugify(this.name, { 
        lower: true,
        strict: true,
        trim: true
      });

      // Verifica se já existe uma loja com esse slug
      const existingStore = await mongoose.models.Store.findOne({ slug: baseSlug });
      if (existingStore) {
        // Se existir, adiciona um timestamp para garantir unicidade
        baseSlug = `${baseSlug}-${Date.now().toString(36)}`;
      }

      this.slug = baseSlug;
    }
    next();
  } catch (error: any) {
    next(error);
  }
});

// Virtual para cupons
storeSchema.virtual('storeCoupons', {
  ref: 'Coupon',
  localField: '_id',
  foreignField: 'store'
});

// Cria ou recupera o modelo
let StoreModel: mongoose.Model<any>;

try {
  // Tenta obter o modelo existente
  StoreModel = mongoose.models.Store || mongoose.model('Store', storeSchema);

  // Não sincroniza índices durante o build
  if (process.env.NODE_ENV !== 'production') {
    StoreModel.syncIndexes().then(() => {
      console.log('=> Store indexes synchronized');
    }).catch((error) => {
      console.error('Error syncing Store indexes:', error);
    });
  }
} catch (error) {
  console.error('Error creating Store model:', error);
  throw error;
}

// Exporta o modelo
export const Store = StoreModel;
