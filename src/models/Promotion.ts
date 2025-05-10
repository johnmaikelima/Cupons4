import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String },
  url: { type: String, required: true },
  provider: { type: String, required: true },
  providerId: { type: String, required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  api: { type: mongoose.Schema.Types.ObjectId, ref: 'Api', required: true },
  discount: { type: Number },
  type: { type: String, enum: ['coupon', 'offer'], required: true },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

promotionSchema.index({ provider: 1, providerId: 1 }, { unique: true });
promotionSchema.index({ store: 1 });
promotionSchema.index({ api: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ active: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ expiresAt: 1 });

export const Promotion = mongoose.models.Promotion || mongoose.model('Promotion', promotionSchema);
