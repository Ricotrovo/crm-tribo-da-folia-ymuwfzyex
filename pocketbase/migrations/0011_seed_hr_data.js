migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'vendedor@tribodafolia.com.br')
      return // exists
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('vendedor@tribodafolia.com.br')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Vendedor Teste')
    record.set('role', 'Vendedor')
    record.set('role_title', 'Vendedor')
    record.set('crm_access_level', 'full')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'vendedor@tribodafolia.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
