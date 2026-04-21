migrate(
  (app) => {
    const collection = new Collection({
      name: 'menus',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'price_weekday', type: 'number' },
        { name: 'price_weekend', type: 'number' },
        { name: 'price_holiday', type: 'number' },
        { name: 'child_free_age_limit', type: 'number' },
        { name: 'extra_guest_price_advance', type: 'number' },
        { name: 'extra_guest_price_day_of', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('menus')
    app.delete(collection)
  },
)
