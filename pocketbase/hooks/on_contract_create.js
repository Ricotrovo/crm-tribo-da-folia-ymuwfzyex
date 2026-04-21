onRecordCreate((e) => {
  const contract = e.record
  let eventDateStr = contract.getString('event_date')
  if (!eventDateStr) return e.next()

  const date = eventDateStr.split(' ')[0] || eventDateStr.split('T')[0]
  const startTime = contract.getString('event_start_time')
  const salon = contract.getString('salon') || contract.getString('salon_selection')

  if (!date || !startTime || !salon) return e.next()

  const existingEvents = $app.findRecordsByFilter(
    'events',
    "date >= {:dateStart} && date <= {:dateEnd} && status != 'cancelled'",
    '-created',
    100,
    0,
    { dateStart: date + ' 00:00:00.000Z', dateEnd: date + ' 23:59:59.999Z' },
  )

  const isSameShift = (t1, t2) => {
    if (!t1 || !t2) return false
    const lunch = ['12:00', '12:30', '14:00']
    const dinner = ['19:00', '19:30', '20:00']
    return (
      (lunch.includes(t1) && lunch.includes(t2)) || (dinner.includes(t1) && dinner.includes(t2))
    )
  }

  for (let ev of existingEvents) {
    if (isSameShift(ev.getString('start_time'), startTime)) {
      const evSalon = ev.getString('salon_selection')
      if (evSalon === 'Both' || salon === 'Both' || evSalon === salon) {
        throw new BadRequestError('Conflict', {
          salon: new ValidationError('conflict', 'Salon already booked for this shift.'),
        })
      }
    }
  }
  e.next()
}, 'contracts')

onRecordAfterCreateSuccess((e) => {
  const contract = e.record
  const eventsCol = $app.findCollectionByNameOrId('events')
  const newEvent = new Record(eventsCol)

  let clientName = 'Unknown'
  try {
    const lead = $app.findRecordById('leads', contract.getString('lead_id'))
    clientName = lead.getString('name')
  } catch (_) {}

  newEvent.set('title', `Party - ${clientName}`)

  let eventDateStr = contract.getString('event_date')
  if (eventDateStr.length === 10) {
    eventDateStr = eventDateStr + ' 12:00:00.000Z'
  }

  newEvent.set('date', eventDateStr)
  newEvent.set('start_time', contract.getString('event_start_time'))
  newEvent.set('salon_selection', contract.getString('salon'))
  newEvent.set('duration', 4)
  newEvent.set('guests', contract.getInt('guest_count') || 50)
  newEvent.set('client_name', clientName)
  newEvent.set('status', 'confirmed')
  newEvent.set('contract_id', contract.id)

  $app.save(newEvent)

  e.next()
}, 'contracts')
