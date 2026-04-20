migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')

    if (!col.fields.getByName('temperature')) {
      col.fields.add(
        new SelectField({ name: 'temperature', values: ['Quente', 'Morno', 'Frio'], maxSelect: 1 }),
      )
    }
    if (!col.fields.getByName('event_date')) {
      col.fields.add(new TextField({ name: 'event_date' }))
    }
    if (!col.fields.getByName('guest_count')) {
      col.fields.add(new NumberField({ name: 'guest_count' }))
    }
    if (!col.fields.getByName('is_existing_client')) {
      col.fields.add(new BoolField({ name: 'is_existing_client' }))
    }
    if (!col.fields.getByName('has_previous_events')) {
      col.fields.add(new BoolField({ name: 'has_previous_events' }))
    }
    if (!col.fields.getByName('referral_info')) {
      col.fields.add(new TextField({ name: 'referral_info' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.fields.removeByName('temperature')
    col.fields.removeByName('event_date')
    col.fields.removeByName('guest_count')
    col.fields.removeByName('is_existing_client')
    col.fields.removeByName('has_previous_events')
    col.fields.removeByName('referral_info')
    app.save(col)
  },
)
