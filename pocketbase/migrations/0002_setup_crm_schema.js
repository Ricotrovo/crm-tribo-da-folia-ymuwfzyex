migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(new TextField({ name: 'role' }))
    app.save(users)

    const leads = new Collection({
      name: 'leads',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'status', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'origin', type: 'text' },
        { name: 'profile_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(leads)

    const events = new Collection({
      name: 'events',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'date', type: 'text' },
        { name: 'time', type: 'text' },
        { name: 'salon', type: 'text' },
        { name: 'client_name', type: 'text' },
        { name: 'guests', type: 'number' },
        { name: 'menu', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'profile_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(events)

    const contracts = new Collection({
      name: 'contracts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'client_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'total_value', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(contracts)

    const payments = new Collection({
      name: 'payments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'contract_id', type: 'relation', collectionId: contracts.id, maxSelect: 1 },
        { name: 'amount', type: 'number' },
        { name: 'due_date', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(payments)

    const stock = new Collection({
      name: 'stock',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text' },
        { name: 'quantity', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(stock)

    const freelancers = new Collection({
      name: 'freelancers',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(freelancers)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('freelancers'))
    app.delete(app.findCollectionByNameOrId('stock'))
    app.delete(app.findCollectionByNameOrId('payments'))
    app.delete(app.findCollectionByNameOrId('contracts'))
    app.delete(app.findCollectionByNameOrId('events'))
    app.delete(app.findCollectionByNameOrId('leads'))
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    app.save(users)
  },
)
