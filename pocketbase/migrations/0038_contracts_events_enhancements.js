migrate(
  (app) => {
    const contracts = app.findCollectionByNameOrId('contracts')
    contracts.fields.add(
      new RelationField({
        name: 'birthday_person_id',
        collectionId: app.findCollectionByNameOrId('children').id,
        maxSelect: 1,
      }),
    )
    contracts.fields.add(new TextField({ name: 'cake_notes' }))
    contracts.fields.add(new TextField({ name: 'theme_notes' }))
    contracts.fields.add(new TextField({ name: 'payment_notes' }))
    contracts.fields.add(new NumberField({ name: 'payment_day', min: 1, max: 31 }))
    app.save(contracts)

    const events = app.findCollectionByNameOrId('events')
    events.fields.add(
      new RelationField({ name: 'contract_id', collectionId: contracts.id, maxSelect: 1 }),
    )
    app.save(events)
  },
  (app) => {
    const contracts = app.findCollectionByNameOrId('contracts')
    contracts.fields.removeByName('birthday_person_id')
    contracts.fields.removeByName('cake_notes')
    contracts.fields.removeByName('theme_notes')
    contracts.fields.removeByName('payment_notes')
    contracts.fields.removeByName('payment_day')
    app.save(contracts)

    const events = app.findCollectionByNameOrId('events')
    events.fields.removeByName('contract_id')
    app.save(events)
  },
)
