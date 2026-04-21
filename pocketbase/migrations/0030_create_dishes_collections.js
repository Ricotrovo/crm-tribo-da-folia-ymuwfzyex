migrate(
  (app) => {
    const dishes = new Collection({
      name: 'dishes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          values: ['Prato Principal', 'Sobremesa', 'Entrada', 'Acompanhamento'],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'base_sale_price', type: 'number' },
        { name: 'is_optional', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(dishes)

    const dish_ingredients = new Collection({
      name: 'dish_ingredients',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'dish_id',
          type: 'relation',
          required: true,
          collectionId: dishes.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'item_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('items').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'base_quantity_50', type: 'number', required: true },
        { name: 'increment_quantity_10', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(dish_ingredients)

    const event_dishes = new Collection({
      name: 'event_dishes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'event_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('events').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'dish_id',
          type: 'relation',
          required: true,
          collectionId: dishes.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(event_dishes)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('event_dishes'))
    app.delete(app.findCollectionByNameOrId('dish_ingredients'))
    app.delete(app.findCollectionByNameOrId('dishes'))
  },
)
