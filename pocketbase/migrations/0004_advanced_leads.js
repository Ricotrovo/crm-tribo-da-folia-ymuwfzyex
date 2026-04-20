migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')

    if (!leads.fields.getByName('spouse_name'))
      leads.fields.add(new TextField({ name: 'spouse_name' }))
    if (!leads.fields.getByName('birthday')) leads.fields.add(new TextField({ name: 'birthday' }))
    if (!leads.fields.getByName('email')) leads.fields.add(new EmailField({ name: 'email' }))
    if (!leads.fields.getByName('instagram')) leads.fields.add(new TextField({ name: 'instagram' }))
    if (!leads.fields.getByName('rg')) leads.fields.add(new TextField({ name: 'rg' }))
    if (!leads.fields.getByName('cpf')) leads.fields.add(new TextField({ name: 'cpf' }))
    if (!leads.fields.getByName('marital_status'))
      leads.fields.add(
        new SelectField({
          name: 'marital_status',
          values: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro'],
          maxSelect: 1,
        }),
      )
    if (!leads.fields.getByName('address_zip'))
      leads.fields.add(new TextField({ name: 'address_zip' }))
    if (!leads.fields.getByName('address_street'))
      leads.fields.add(new TextField({ name: 'address_street' }))
    if (!leads.fields.getByName('address_number'))
      leads.fields.add(new TextField({ name: 'address_number' }))
    if (!leads.fields.getByName('address_complement'))
      leads.fields.add(new TextField({ name: 'address_complement' }))
    if (!leads.fields.getByName('address_neighborhood'))
      leads.fields.add(new TextField({ name: 'address_neighborhood' }))
    if (!leads.fields.getByName('address_city'))
      leads.fields.add(new TextField({ name: 'address_city' }))
    if (!leads.fields.getByName('address_state'))
      leads.fields.add(new TextField({ name: 'address_state' }))

    app.save(leads)

    try {
      app.findCollectionByNameOrId('children')
    } catch (_) {
      const children = new Collection({
        name: 'children',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'lead_id',
            type: 'relation',
            required: true,
            collectionId: leads.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          { name: 'name', type: 'text', required: true },
          { name: 'birthday', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(children)
    }

    try {
      app.findCollectionByNameOrId('interactions')
    } catch (_) {
      const interactions = new Collection({
        name: 'interactions',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'lead_id',
            type: 'relation',
            required: true,
            collectionId: leads.id,
            cascadeDelete: true,
            maxSelect: 1,
          },
          {
            name: 'type',
            type: 'select',
            values: ['Visit', 'Tasting', 'Negotiation', 'Call', 'Message', 'Other'],
            maxSelect: 1,
          },
          { name: 'notes', type: 'text' },
          {
            name: 'feedback',
            type: 'select',
            values: ['Positive', 'Negative', 'Neutral'],
            maxSelect: 1,
          },
          { name: 'interaction_date', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(interactions)
    }
  },
  (app) => {
    try {
      const interactions = app.findCollectionByNameOrId('interactions')
      app.delete(interactions)
    } catch (_) {}

    try {
      const children = app.findCollectionByNameOrId('children')
      app.delete(children)
    } catch (_) {}

    try {
      const leads = app.findCollectionByNameOrId('leads')
      leads.fields.removeByName('spouse_name')
      leads.fields.removeByName('birthday')
      leads.fields.removeByName('email')
      leads.fields.removeByName('instagram')
      leads.fields.removeByName('rg')
      leads.fields.removeByName('cpf')
      leads.fields.removeByName('marital_status')
      leads.fields.removeByName('address_zip')
      leads.fields.removeByName('address_street')
      leads.fields.removeByName('address_number')
      leads.fields.removeByName('address_complement')
      leads.fields.removeByName('address_neighborhood')
      leads.fields.removeByName('address_city')
      leads.fields.removeByName('address_state')
      app.save(leads)
    } catch (_) {}
  },
)
