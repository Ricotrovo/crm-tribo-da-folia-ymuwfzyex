migrate(
  (app) => {
    const items = app.findCollectionByNameOrId('items')
    items.fields.add(
      new SelectField({
        name: 'unit',
        maxSelect: 1,
        values: ['un', 'box', 'package', 'kg', 'liter', 'hundred'],
      }),
    )
    app.save(items)

    const categories = app.findCollectionByNameOrId('item_categories')
    categories.updateRule = "@request.auth.id != ''"
    categories.deleteRule = "@request.auth.id != ''"
    app.save(categories)
  },
  (app) => {
    const items = app.findCollectionByNameOrId('items')
    items.fields.add(
      new SelectField({
        name: 'unit',
        maxSelect: 1,
        values: ['un', 'box', 'package', 'kg', 'liter'],
      }),
    )
    app.save(items)
  },
)
