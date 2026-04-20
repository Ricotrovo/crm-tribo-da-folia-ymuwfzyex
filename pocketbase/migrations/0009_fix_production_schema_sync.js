migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('leads')

    if (!collection.fields.getByName('last_contact_date')) {
      collection.fields.add(
        new TextField({
          name: 'last_contact_date',
          required: false,
        }),
      )
    }

    collection.listRule = "@request.auth.id != ''"
    collection.viewRule = "@request.auth.id != ''"
    collection.createRule = "@request.auth.id != ''"
    collection.updateRule = "@request.auth.id != ''"
    collection.deleteRule = "@request.auth.id != ''"

    app.save(collection)
  },
  (app) => {
    // Down migration left intentionally empty to prevent data loss
  },
)
