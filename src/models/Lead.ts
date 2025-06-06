import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: false },
  password: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ComparisonProduct', required: true },
  targetPrice: { type: Number, required: true }, // Preço que estava quando o usuário pediu notificação
  createdAt: { type: Date, default: Date.now },
  lastNotified: { type: Date, default: null }
});

// Índice composto para evitar duplicatas do mesmo produto para o mesmo telefone
leadSchema.index({ phone: 1, productId: 1 }, { unique: true });

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
