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

  let total = e.record.getFloat('total_value')

  if (duration > 4) {
    const extra = duration - 4
    const overtime = extra * (total * 0.25)
    e.record.set('total_value', total + overtime)
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

  e.next()
}, 'contracts')
