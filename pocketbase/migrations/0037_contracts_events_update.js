migrate(
  (app) => {
    const events = app.findCollectionByNameOrId('events')
    events.fields.add(
      new SelectField({
        name: 'salon_selection',
        values: ['Salon 1', 'Salon 2', 'Both'],
        maxSelect: 1,
      }),
    )
    events.fields.add(
      new SelectField({
        name: 'start_time',
        values: ['12:00', '12:30', '14:00', '19:00', '19:30', '20:00'],
        maxSelect: 1,
      }),
    )
    events.fields.add(new NumberField({ name: 'duration' }))
    events.fields.add(new TextField({ name: 'theme' }))
    events.fields.add(new TextField({ name: 'cake_flavor' }))
    events.fields.add(
      new RelationField({
        name: 'decoration_supplier_id',
        collectionId: app.findCollectionByNameOrId('suppliers').id,
        maxSelect: 1,
      }),
    )
    app.save(events)

    const contracts = app.findCollectionByNameOrId('contracts')
    contracts.fields.add(new JSONField({ name: 'items_breakdown' }))
    contracts.fields.add(new TextField({ name: 'payment_method' }))
    contracts.fields.add(new NumberField({ name: 'installments' }))
    contracts.fields.add(
      new RelationField({
        name: 'decoration_supplier_id',
        collectionId: app.findCollectionByNameOrId('suppliers').id,
        maxSelect: 1,
      }),
    )
    app.save(contracts)

    const payments = app.findCollectionByNameOrId('payments')
    payments.fields.add(new TextField({ name: 'payment_method' }))
    payments.fields.add(new TextField({ name: 'payout_date' }))
    app.save(payments)
  },
  (app) => {
    const events = app.findCollectionByNameOrId('events')
    events.fields.removeByName('salon_selection')
    events.fields.removeByName('start_time')
    events.fields.removeByName('duration')
    events.fields.removeByName('theme')
    events.fields.removeByName('cake_flavor')
    events.fields.removeByName('decoration_supplier_id')
    app.save(events)

    const contracts = app.findCollectionByNameOrId('contracts')
    contracts.fields.removeByName('items_breakdown')
    contracts.fields.removeByName('payment_method')
    contracts.fields.removeByName('installments')
    contracts.fields.removeByName('decoration_supplier_id')
    app.save(contracts)

    const payments = app.findCollectionByNameOrId('payments')
    payments.fields.removeByName('payment_method')
    payments.fields.removeByName('payout_date')
    app.save(payments)
  },
)
