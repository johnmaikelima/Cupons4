import mongoose from 'mongoose';

const siteConfigSchema = new mongoose.Schema({
  logo: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Linkcompra'
  }
}, {
  timestamps: true
});

export const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema);
