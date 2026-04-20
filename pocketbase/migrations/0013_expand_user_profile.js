migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const newFields = [
      { name: 'rg', type: 'text' },
      { name: 'cpf', type: 'text' },
      { name: 'work_permit_number', type: 'text' },
      { name: 'work_permit_series', type: 'text' },
      { name: 'pix_key', type: 'text' },
      { name: 'cnh_category', type: 'text' },
      { name: 'address_street', type: 'text' },
      { name: 'address_number', type: 'text' },
      { name: 'address_neighborhood', type: 'text' },
      { name: 'address_city', type: 'text' },
      { name: 'address_state', type: 'text' },
      { name: 'address_zip', type: 'text' },
      { name: 'phone', type: 'text' },
      { name: 'instagram', type: 'text' },
      { name: 'tiktok', type: 'text' },
      { name: 'emergency_contact', type: 'text' },
    ]

    for (const f of newFields) {
      if (!users.fields.getByName(f.name)) {
        users.fields.add(new TextField({ name: f.name }))
      }
    }

    users.addIndex('idx_users_cpf_unique', true, 'cpf', "cpf != ''")

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const fieldsToRemove = [
      'rg',
      'cpf',
      'work_permit_number',
      'work_permit_series',
      'pix_key',
      'cnh_category',
      'address_street',
      'address_number',
      'address_neighborhood',
      'address_city',
      'address_state',
      'address_zip',
      'phone',
      'instagram',
      'tiktok',
      'emergency_contact',
    ]

    for (const f of fieldsToRemove) {
      users.fields.removeByName(f)
    }

    users.removeIndex('idx_users_cpf_unique')

    app.save(users)
  },
)
