migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.deleteRule = "id = @request.auth.id || @request.auth.role = 'gerente'"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('_pb_users_auth_')
    col.deleteRule = 'id = @request.auth.id'
    app.save(col)
  },
)
