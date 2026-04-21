migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('items')
    col.fields.add(new NumberField({ name: 'cost_price' }))
    col.fields.add(new NumberField({ name: 'sale_price' }))
    col.fields.add(new NumberField({ name: 'included_quantity' }))
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('items')
    col.fields.removeByName('cost_price')
    col.fields.removeByName('sale_price')
    col.fields.removeByName('included_quantity')
    app.save(col)
  },
)
