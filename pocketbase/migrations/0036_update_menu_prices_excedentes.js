migrate((app) => {
  const menus = [
    { name: 'Escolar', base: 4500, adv: 60, day: 80, isEscolar: true },
    { name: 'Supremo', base: 7990, adv: 60, day: 80, isEscolar: false },
    { name: 'Prime', base: 9990, adv: 80, day: 100, isEscolar: false },
    { name: 'Boteco', base: 12990, adv: 100, day: 120, isEscolar: false },
    { name: 'Gold Gourmet', base: 16990, adv: 150, day: 200, isEscolar: false },
  ]
  const col = app.findCollectionByNameOrId('menus')

  for (const m of menus) {
    try {
      const record = app.findFirstRecordByData('menus', 'name', m.name)
      record.set('price_weekend', m.base)
      record.set('price_weekday', m.isEscolar ? m.base : m.base - 1500)
      record.set('price_holiday', m.isEscolar ? m.base : m.base - 500)
      record.set('extra_guest_price_advance', m.adv)
      record.set('extra_guest_price_day_of', m.day)
      app.save(record)
    } catch (_) {
      const record = new Record(col)
      record.set('name', m.name)
      record.set('price_weekend', m.base)
      record.set('price_weekday', m.isEscolar ? m.base : m.base - 1500)
      record.set('price_holiday', m.isEscolar ? m.base : m.base - 500)
      record.set('extra_guest_price_advance', m.adv)
      record.set('extra_guest_price_day_of', m.day)
      app.save(record)
    }
  }
})
