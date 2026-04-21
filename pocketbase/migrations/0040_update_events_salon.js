migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('events')
    const field = col.fields.getByName('salon_selection')
    if (field) {
      field.values = ['Salon 1', 'Salon 2', 'Both', 'KidseTeensPremium']
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('events')
    const field = col.fields.getByName('salon_selection')
    if (field) {
      field.values = ['Salon 1', 'Salon 2', 'Both']
    }
    app.save(col)
  },
)
