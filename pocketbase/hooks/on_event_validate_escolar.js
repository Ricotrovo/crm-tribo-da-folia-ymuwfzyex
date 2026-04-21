onRecordValidate((e) => {
  const menuName = e.record.getString('menu') || ''
  if (menuName.toLowerCase() !== 'escolar') return e.next()

  const dateStr = e.record.getString('date')
  const timeStr = e.record.getString('time')

  if (dateStr) {
    const d = new Date(dateStr)
    const day = d.getUTCDay()
    if (day === 0 || day === 6) {
      throw new BadRequestError('Validation failed', {
        date: new ValidationError(
          'invalid_date',
          'O pacote Escolar só é permitido de Segunda a Sexta-feira.',
        ),
      })
    }
  }

  if (timeStr) {
    const parts = timeStr.split(':')
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)
      const timeInMins = hours * 60 + minutes
      if (timeInMins < 14 * 60 || timeInMins > 17 * 60) {
        throw new BadRequestError('Validation failed', {
          time: new ValidationError(
            'invalid_time',
            'O pacote Escolar só é permitido no horário de 14:00 às 17:00.',
          ),
        })
      }
    }
  }

  return e.next()
}, 'events')
