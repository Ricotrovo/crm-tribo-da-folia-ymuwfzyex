migrate(
  (app) => {
    const menusId = app.findCollectionByNameOrId('menus').id
    const dishesId = app.findCollectionByNameOrId('dishes').id

    const collection = new Collection({
      name: 'menu_dishes',
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
          name: 'dish_id',
          type: 'relation',
          required: true,
          collectionId: dishesId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('menu_dishes')
    app.delete(collection)
  },
)
