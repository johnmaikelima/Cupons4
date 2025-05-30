import mongoose from 'mongoose';

export interface IProduct {
  aw_deep_link: string;
  merchant_image_url: string;
  product_name: string;
  merchant_category: string;
  store_price: number;
  ean: string;
  rating?: number;
  description?: string;
  merchant_name?: string;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  aw_deep_link: { type: String, required: true },
  merchant_image_url: { type: String, required: true },
  product_name: { type: String, required: true },
  merchant_category: { type: String, required: true },
  store_price: { type: Number, required: true },
  ean: { type: String, required: true },
  rating: { type: Number, required: false, default: 0 },
  description: { type: String, required: false, default: '' },
  merchant_name: { type: String, required: false, default: '' },
  currency: { type: String, required: false, default: 'BRL' },
}, {
  timestamps: true,
});

// Criar índices para melhorar a performance das buscas
productSchema.index({ product_name: 'text', merchant_category: 'text' });
productSchema.index({ merchant_category: 1 });
productSchema.index({ ean: 1 });

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
