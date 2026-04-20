migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('emergency_contact_name')) {
      users.fields.add(new TextField({ name: 'emergency_contact_name' }))
    }
    if (!users.fields.getByName('emergency_contact_phone')) {
      users.fields.add(new TextField({ name: 'emergency_contact_phone' }))
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('emergency_contact_name')
    users.fields.removeByName('emergency_contact_phone')
    app.save(users)
  },
)
