migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'r.trovo@gmail.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('r.trovo@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      record.set('role', 'gerente')
      app.save(record)
    }

    const menusCol = app.findCollectionByNameOrId('menus')
    const names = ['Escolar', 'Supremo', 'Prime', 'Boteco', 'Gold Gourmet']

    for (const name of names) {
      try {
        app.findFirstRecordByData('menus', 'name', name)
      } catch (_) {
        const record = new Record(menusCol)
        record.set('name', name)
        record.set('price_weekday', 100)
        record.set('price_weekend', 120)
        record.set('price_holiday', 150)
        record.set('child_free_age_limit', 5)
        record.set('extra_guest_price_advance', 50)
        record.set('extra_guest_price_day_of', 70)
        app.save(record)
      }
    }
  },
  (app) => {
    // Safe down function
  },
)
