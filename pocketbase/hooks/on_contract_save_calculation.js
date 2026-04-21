onRecordCreate((e) => {
  let duration = e.record.getInt('duration')
  if (duration <= 0) {
    duration = 4
    e.record.set('duration', duration)
  }

  const startTime = e.record.getString('event_start_time')
  if (startTime && !e.record.getString('event_end_time')) {
    const parts = startTime.split(':')
    if (parts.length === 2) {
      let h = parseInt(parts[0], 10)
      let m = parts[1]
      h = (h + duration) % 24
      e.record.set('event_end_time', `${h.toString().padStart(2, '0')}:${m}`)
    }
  }

  const breakdown = e.record.get('items_breakdown')
  if (breakdown) {
    try {
      let parsed = typeof breakdown === 'string' ? JSON.parse(breakdown) : breakdown
      if (parsed && typeof parsed === 'object') {
        const baseValue = parseFloat(parsed.baseValue) || 0
        const discount = parseFloat(parsed.discount) || 0
        const extraGuestsValue = parseFloat(parsed.extraGuestsValue) || 0
        const photoVal =
          parsed.photographer && !parsed.photographer_courtesy
            ? parseFloat(parsed.photoVal) || 0
            : 0
        const decoVal =
          parsed.extra_decoration && !parsed.extra_decoration_courtesy
            ? parseFloat(parsed.decoVal) || 0
            : 0

        const subTotal = baseValue - discount + extraGuestsValue + photoVal + decoVal
        const extraHours = Math.max(0, duration - 4)
        const extraHoursFee = extraHours > 0 ? subTotal * 0.25 * extraHours : 0

        const totalValue = subTotal + extraHoursFee
        e.record.set('total_value', totalValue)

        parsed.extraHoursFee = extraHoursFee
        parsed.subTotal = subTotal
        parsed.calculatedTotal = totalValue
        e.record.set('items_breakdown', parsed)
      }
    } catch (_) {}
  }

  e.next()
}, 'contracts')

onRecordUpdate((e) => {
  let duration = e.record.getInt('duration')
  if (duration <= 0) {
    duration = 4
    e.record.set('duration', duration)
  }

  const startTime = e.record.getString('event_start_time')
  if (startTime) {
    const parts = startTime.split(':')
    if (parts.length === 2) {
      let h = parseInt(parts[0], 10)
      let m = parts[1]
      h = (h + duration) % 24
      e.record.set('event_end_time', `${h.toString().padStart(2, '0')}:${m}`)
    }
  }

  const breakdown = e.record.get('items_breakdown')
  if (breakdown) {
    try {
      let parsed = typeof breakdown === 'string' ? JSON.parse(breakdown) : breakdown
      if (parsed && typeof parsed === 'object') {
        const baseValue = parseFloat(parsed.baseValue) || 0
        const discount = parseFloat(parsed.discount) || 0
        const extraGuestsValue = parseFloat(parsed.extraGuestsValue) || 0
        const photoVal =
          parsed.photographer && !parsed.photographer_courtesy
            ? parseFloat(parsed.photoVal) || 0
            : 0
        const decoVal =
          parsed.extra_decoration && !parsed.extra_decoration_courtesy
            ? parseFloat(parsed.decoVal) || 0
            : 0

        const subTotal = baseValue - discount + extraGuestsValue + photoVal + decoVal
        const extraHours = Math.max(0, duration - 4)
        const extraHoursFee = extraHours > 0 ? subTotal * 0.25 * extraHours : 0

        const totalValue = subTotal + extraHoursFee
        e.record.set('total_value', totalValue)

        parsed.extraHoursFee = extraHoursFee
        parsed.subTotal = subTotal
        parsed.calculatedTotal = totalValue
        e.record.set('items_breakdown', parsed)
      }
    } catch (_) {}
  }

  e.next()
}, 'contracts')
