migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')
    if (!col.fields.getByName('lead_id')) {
      col.fields.add(
        new RelationField({
          name: 'lead_id',
          collectionId: app.findCollectionByNameOrId('leads').id,
          maxSelect: 1,
          cascadeDelete: true,
        }),
      )
    }
    if (!col.fields.getByName('contract_number')) {
      col.fields.add(new TextField({ name: 'contract_number' }))
    }
    if (!col.fields.getByName('event_date')) {
      col.fields.add(new TextField({ name: 'event_date' }))
    }
    if (!col.fields.getByName('notes')) {
      col.fields.add(new TextField({ name: 'notes' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')
    col.fields.removeByName('lead_id')
    col.fields.removeByName('contract_number')
    col.fields.removeByName('event_date')
    col.fields.removeByName('notes')
    app.save(col)
  },
)
