migrate(
  (app) => {
    // 1. Remove duplicates — keep the oldest record per phone
    app
      .db()
      .newQuery(`
    DELETE FROM leads WHERE id NOT IN (
      SELECT MIN(id) FROM leads GROUP BY phone
    ) AND phone IS NOT NULL AND phone != ''
  `)
      .execute()

    // 2. Now safe to add the unique index
    const col = app.findCollectionByNameOrId('leads')
    col.addIndex('idx_leads_phone_unique', true, 'phone', "phone != ''")
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.removeIndex('idx_leads_phone_unique')
    app.save(col)
  },
)
