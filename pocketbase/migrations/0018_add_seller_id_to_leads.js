migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    if (!col.fields.getByName('seller_id')) {
      col.fields.add(
        new RelationField({
          name: 'seller_id',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          cascadeDelete: false,
        }),
      )
    }
    app.save(col)

    // Migrate existing assignments to the new field
    app
      .db()
      .newQuery(
        `UPDATE leads SET seller_id = profile_id WHERE profile_id IS NOT NULL AND profile_id != ''`,
      )
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.fields.removeByName('seller_id')
    app.save(col)
  },
)
