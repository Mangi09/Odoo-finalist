function normalizeDiscountPercent(value) {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function calculateQuotationTotals(items = [], globalDiscountPercent = 0) {
  const subtotalAmount = Math.round(items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0));
  const subtotalMargin = Math.round(items.reduce((sum, item) => sum + Number(item.lineMargin || 0), 0));
  const discountPercent = normalizeDiscountPercent(globalDiscountPercent);
  const globalDiscountAmount = Math.round(subtotalAmount * (discountPercent / 100));

  return {
    subtotalAmount,
    globalDiscountPercent: discountPercent,
    globalDiscountAmount,
    totalAmount: Math.max(0, subtotalAmount - globalDiscountAmount),
    totalMargin: subtotalMargin - globalDiscountAmount,
  };
}

module.exports = {
  normalizeDiscountPercent,
  calculateQuotationTotals,
};
