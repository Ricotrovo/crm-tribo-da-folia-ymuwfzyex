migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('payments')

    collection.fields.add(
      new RelationField({
        name: 'recorded_by',
        type: 'relation',
        collectionId: '_pb_users_auth_',
        cascadeDelete: false,
        maxSelect: 1,
      }),
    )

    collection.createRule = "@request.auth.id != ''"
    collection.updateRule = "@request.auth.role ~ 'gerente' || @request.auth.role ~ 'Gerente'"
    collection.deleteRule = "@request.auth.role ~ 'gerente' || @request.auth.role ~ 'Gerente'"

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('payments')
    collection.fields.removeByName('recorded_by')
    collection.updateRule = "@request.auth.id != ''"
    collection.deleteRule = "@request.auth.id != ''"
    app.save(collection)
  },
)
