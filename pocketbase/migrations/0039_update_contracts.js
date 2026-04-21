migrate(
  (app) => {
    const contracts = app.findCollectionByNameOrId('contracts')

    contracts.fields.add(new TextField({ name: 'event_start_time' }))
    contracts.fields.add(new TextField({ name: 'event_end_time' }))
    contracts.fields.add(new NumberField({ name: 'guest_count' }))
    contracts.fields.add(
      new SelectField({
        name: 'salon',
        values: ['Salon 1', 'Salon 2', 'Both', 'KidseTeensPremium'],
        maxSelect: 1,
      }),
    )
    contracts.fields.add(new BoolField({ name: 'has_alcohol' }))
    contracts.fields.add(new TextField({ name: 'courtesies' }))
    contracts.fields.add(new EditorField({ name: 'bank_details' }))
    contracts.fields.add(
      new RelationField({
        name: 'menu_id',
        collectionId: app.findCollectionByNameOrId('menus').id,
        maxSelect: 1,
      }),
    )

    app.save(contracts)
  },
  (app) => {
    const contracts = app.findCollectionByNameOrId('contracts')

    contracts.fields.removeByName('event_start_time')
    contracts.fields.removeByName('event_end_time')
    contracts.fields.removeByName('guest_count')
    contracts.fields.removeByName('salon')
    contracts.fields.removeByName('has_alcohol')
    contracts.fields.removeByName('courtesies')
    contracts.fields.removeByName('bank_details')
    contracts.fields.removeByName('menu_id')

    app.save(contracts)
  },
)
