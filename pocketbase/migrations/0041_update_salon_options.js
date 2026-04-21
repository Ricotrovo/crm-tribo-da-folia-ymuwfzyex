migrate(
  (app) => {
    // Update existing events
    app
      .db()
      .newQuery(
        `UPDATE events SET salon_selection = 'Espaço Premium' WHERE salon_selection = 'Salon 1'`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `UPDATE events SET salon_selection = 'Espaço Kids&Teens' WHERE salon_selection IN ('Salon 2', 'KidseTeensPremium')`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `UPDATE events SET salon_selection = 'Ambos os Salões' WHERE salon_selection = 'Both'`,
      )
      .execute()

    // Update existing contracts
    app
      .db()
      .newQuery(`UPDATE contracts SET salon = 'Espaço Premium' WHERE salon = 'Salon 1'`)
      .execute()
    app
      .db()
      .newQuery(
        `UPDATE contracts SET salon = 'Espaço Kids&Teens' WHERE salon IN ('Salon 2', 'KidseTeensPremium')`,
      )
      .execute()
    app
      .db()
      .newQuery(`UPDATE contracts SET salon = 'Ambos os Salões' WHERE salon = 'Both'`)
      .execute()

    // Update Events Schema
    const events = app.findCollectionByNameOrId('events')
    const salonSelectionField = events.fields.getByName('salon_selection')
    if (salonSelectionField) {
      salonSelectionField.values = ['Espaço Premium', 'Espaço Kids&Teens', 'Ambos os Salões']
    }
    app.save(events)

    // Update Contracts Schema
    const contracts = app.findCollectionByNameOrId('contracts')
    const salonField = contracts.fields.getByName('salon')
    if (salonField) {
      salonField.values = ['Espaço Premium', 'Espaço Kids&Teens', 'Ambos os Salões']
    }
    app.save(contracts)
  },
  (app) => {
    // Revert existing records
    app
      .db()
      .newQuery(
        `UPDATE events SET salon_selection = 'Salon 1' WHERE salon_selection = 'Espaço Premium'`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `UPDATE events SET salon_selection = 'Salon 2' WHERE salon_selection = 'Espaço Kids&Teens'`,
      )
      .execute()
    app
      .db()
      .newQuery(
        `UPDATE events SET salon_selection = 'Both' WHERE salon_selection = 'Ambos os Salões'`,
      )
      .execute()

    app
      .db()
      .newQuery(`UPDATE contracts SET salon = 'Salon 1' WHERE salon = 'Espaço Premium'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE contracts SET salon = 'Salon 2' WHERE salon = 'Espaço Kids&Teens'`)
      .execute()
    app
      .db()
      .newQuery(`UPDATE contracts SET salon = 'Both' WHERE salon = 'Ambos os Salões'`)
      .execute()

    // Revert Schema
    const events = app.findCollectionByNameOrId('events')
    const salonSelectionField = events.fields.getByName('salon_selection')
    if (salonSelectionField) {
      salonSelectionField.values = ['Salon 1', 'Salon 2', 'Both', 'KidseTeensPremium']
    }
    app.save(events)

    const contracts = app.findCollectionByNameOrId('contracts')
    const salonField = contracts.fields.getByName('salon')
    if (salonField) {
      salonField.values = ['Salon 1', 'Salon 2', 'Both', 'KidseTeensPremium']
    }
    app.save(contracts)
  },
)
