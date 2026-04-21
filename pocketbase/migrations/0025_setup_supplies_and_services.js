migrate(
  (app) => {
    const suppliers = new Collection({
      name: 'suppliers',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'contact_person', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'document', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(suppliers)

    const categories = new Collection({
      name: 'item_categories',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['product', 'service'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(categories)

    const items = new Collection({
      name: 'items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['product', 'service'],
          maxSelect: 1,
        },
        { name: 'category_id', type: 'relation', collectionId: categories.id, maxSelect: 1 },
        { name: 'supplier_id', type: 'relation', collectionId: suppliers.id, maxSelect: 1 },
        {
          name: 'unit',
          type: 'select',
          values: ['un', 'box', 'package', 'kg', 'liter'],
          maxSelect: 1,
        },
        { name: 'color', type: 'text' },
        { name: 'size', type: 'text' },
        { name: 'base_price', type: 'number' },
        { name: 'additional_price', type: 'number' },
        { name: 'stock_quantity', type: 'number' },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(items)

    const eventsCollection = app.findCollectionByNameOrId('events')

    const event_items = new Collection({
      name: 'event_items',
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
          collectionId: eventsCollection.id,
          maxSelect: 1,
        },
        { name: 'item_id', type: 'relation', required: true, collectionId: items.id, maxSelect: 1 },
        {
          name: 'supplier_id',
          type: 'relation',
          required: true,
          collectionId: suppliers.id,
          maxSelect: 1,
        },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unit_price', type: 'number' },
        { name: 'total_price', type: 'number' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(event_items)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('event_items'))
    app.delete(app.findCollectionByNameOrId('items'))
    app.delete(app.findCollectionByNameOrId('item_categories'))
    app.delete(app.findCollectionByNameOrId('suppliers'))
  },
)
