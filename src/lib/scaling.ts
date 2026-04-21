/**
 * Calculates ingredient requirements based on guest count and scaling rules.
 * Base logic: 50 guests.
 * For every 10 guests above 50, adds incrementQuantity10 to baseQuantity50.
 */
export function calculateIngredientRequirement(
  baseQty50: number,
  incQty10: number,
  guests: number,
): number {
  if (guests <= 0) return 0
  if (guests <= 50) return baseQty50
  const extraGuests = guests - 50
  const blocksOf10 = Math.ceil(extraGuests / 10)
  // Scaling by 10% for every 10 extra guests
  const increment = baseQty50 * 0.1
  return baseQty50 + blocksOf10 * increment
}

export function getUnitHint(val: number | string, unit?: string) {
  const num = Number(val)
  if (!num || isNaN(num) || !unit) return ''
  if (unit === 'kg') return `${(num * 1000).toFixed(0)}g`
  if (unit === 'liter') return `${(num * 1000).toFixed(0)}ml`
  return `${num.toFixed(3)} ${unit === 'hundred' ? 'centos' : unit}`
}
