migrate(
  (app) => {
    const events = app.findCollectionByNameOrId('events')
    const salonField = events.fields.getByName('salon_selection')
    if (salonField) {
      salonField.values = ['Espaço Premium', 'Espaço Kids&Teens', 'Prime & KidsTeens']
    }
    app.save(events)

    const contracts = app.findCollectionByNameOrId('contracts')
    const contractSalonField = contracts.fields.getByName('salon')
    if (contractSalonField) {
      contractSalonField.values = ['Espaço Premium', 'Espaço Kids&Teens', 'Prime & KidsTeens']
    }
    app.save(contracts)
  },
  (app) => {
    const events = app.findCollectionByNameOrId('events')
    const salonField = events.fields.getByName('salon_selection')
    if (salonField) {
      salonField.values = ['Espaço Premium', 'Espaço Kids&Teens', 'Ambos os Salões']
    }
    app.save(events)

    const contracts = app.findCollectionByNameOrId('contracts')
    const contractSalonField = contracts.fields.getByName('salon')
    if (contractSalonField) {
      contractSalonField.values = ['Espaço Premium', 'Espaço Kids&Teens', 'Ambos os Salões']
    }
    app.save(contracts)
  },
)
