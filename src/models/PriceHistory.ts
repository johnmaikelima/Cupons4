import { Schema, model, models, Model, Document } from 'mongoose';

export interface PriceHistory {
  date: Date;
  price: number;
  store: string;
}

export interface ProductPriceHistory extends Document {
  productId: string;
  ean: string;
  history: PriceHistory[];
}

const priceHistorySchema = new Schema<ProductPriceHistory>({
  productId: { type: String, required: true, index: true },
  ean: { type: String, required: true, index: true },
  history: [{
    date: { type: Date, required: true },
    price: { type: Number, required: true },
    store: { type: String, required: true }
  }]
}, {
  timestamps: true
});

// Índice composto para consultas eficientes
priceHistorySchema.index({ productId: 1, 'history.date': -1 });

export const PriceHistoryModel = models.PriceHistory || model<ProductPriceHistory>('PriceHistory', priceHistorySchema);
