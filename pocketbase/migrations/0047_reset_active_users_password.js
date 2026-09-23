migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const records = app.findRecordsByFilter(
      '_pb_users_auth_',
      "status = 'active' || status = ''",
      '-created',
      100,
      0,
    )

    for (const record of records) {
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      app.save(record)
    }
  },
  (app) => {},
)
