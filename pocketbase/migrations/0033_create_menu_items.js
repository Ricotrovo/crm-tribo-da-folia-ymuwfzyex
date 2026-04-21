migrate(
  (app) => {
    const menusId = app.findCollectionByNameOrId('menus').id
    const itemsId = app.findCollectionByNameOrId('items').id

    const collection = new Collection({
      name: 'menu_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'menu_id',
          type: 'relation',
          required: true,
          collectionId: menusId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'item_id',
          type: 'relation',
          required: true,
          collectionId: itemsId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('menu_items')
    app.delete(collection)
  },
)
