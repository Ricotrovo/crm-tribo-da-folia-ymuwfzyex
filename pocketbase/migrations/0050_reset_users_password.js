migrate(
  (app) => {
    // Reset password of all existing users to "12345678" and ensure verified: true
    const records = app.findRecordsByFilter('_pb_users_auth_', 'id != ""', '-created', 500, 0)

    for (const record of records) {
      record.setPassword('12345678')
      record.setVerified(true)
      app.save(record)
    }
  },
  (app) => {},
)
