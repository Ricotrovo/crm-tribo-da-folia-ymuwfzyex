migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')

    if (!col.fields.getByName('last_contact_date')) {
      col.fields.add(new TextField({ name: 'last_contact_date' }))
    }

    col.addIndex('idx_leads_last_contact', false, 'last_contact_date', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.removeIndex('idx_leads_last_contact')

    try {
      col.fields.removeByName('last_contact_date')
    } catch (_) {
      // ignore if field doesn't exist
    }

    app.save(col)
  },
)
