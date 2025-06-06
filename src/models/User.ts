import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: false },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  favoriteProducts: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ComparisonProduct' },
    createdAt: { type: Date, default: Date.now },
    lastNotified: { type: Date, default: null }
  }],
  createdAt: { type: Date, default: Date.now },
  lastNotified: { type: Date }
}, {
  strict: true, // Garante que apenas os campos definidos serão salvos
  strictQuery: true // Garante que apenas os campos definidos serão usados em queries
});

// Cria índice único para o telefone
userSchema.index({ phone: 1 }, { unique: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
