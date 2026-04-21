migrate(
  (app) => {
    const contracts = app.findCollectionByNameOrId('contracts')

    if (!contracts.fields.getByName('status')) {
      contracts.fields.add(
        new SelectField({
          name: 'status',
          values: ['draft', 'active', 'canceled', 'finalized'],
        }),
      )
    }
    if (!contracts.fields.getByName('duration')) {
      contracts.fields.add(new NumberField({ name: 'duration' }))
    }
    app.save(contracts)
  },
  (app) => {
    const contracts = app.findCollectionByNameOrId('contracts')
    contracts.fields.removeByName('status')
    contracts.fields.removeByName('duration')
    app.save(contracts)
  },
)
