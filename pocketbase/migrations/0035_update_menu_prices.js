migrate(
  (app) => {
    const menus = [
      { name: 'Escolar', base: 4500, extraAdv: 60, extraDay: 80 },
      { name: 'Supremo', base: 7990, extraAdv: 60, extraDay: 80 },
      { name: 'Prime', base: 9990, extraAdv: 80, extraDay: 100 },
      { name: 'Boteco', base: 12990, extraAdv: 100, extraDay: 120 },
      { name: 'Gold Gourmet', base: 16990, extraAdv: 150, extraDay: 200 },
    ]

    const collection = app.findCollectionByNameOrId('menus')

    menus.forEach((m) => {
      let record
      try {
        record = app.findFirstRecordByData('menus', 'name', m.name)
      } catch (_) {
        record = new Record(collection)
        record.set('name', m.name)
      }

      record.set('price_weekend', m.base)
      record.set('price_weekday', m.base - 1500)
      record.set('price_holiday', m.base - 500)
      record.set('extra_guest_price_advance', m.extraAdv)
      record.set('extra_guest_price_day_of', m.extraDay)

      app.save(record)
    })
  },
  (app) => {
    // Revert not strictly needed for this data seeding
  },
)
