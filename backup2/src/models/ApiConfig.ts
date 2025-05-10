import mongoose from 'mongoose';

const apiConfigSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provider: { type: String, required: true },
  appToken: { type: String, required: true },
  sourceId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastSync: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

apiConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const ApiConfig = mongoose.models.ApiConfig || mongoose.model('ApiConfig', apiConfigSchema);
