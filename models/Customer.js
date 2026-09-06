const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    salespersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    tierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerTier',
      required: true,
      index: true,
    },
    portalEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

customerSchema.virtual('name').get(function() {
  return this.companyName;
});

module.exports = mongoose.model('Customer', customerSchema);
