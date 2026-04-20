migrate(
  (app) => {
    const freelancersCollection = app.findCollectionByNameOrId('freelancers')
    const collection = new Collection({
      name: 'freelancer_evaluations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'freelancer_id',
          type: 'relation',
          required: true,
          collectionId: freelancersCollection.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'frequency', type: 'number', required: true },
        { name: 'punctuality', type: 'number', required: true },
        { name: 'participation', type: 'number', required: true },
        { name: 'education', type: 'number', required: true },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('freelancer_evaluations')
    app.delete(collection)
  },
)
