migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('resignation_date')) {
      users.fields.add(new TextField({ name: 'resignation_date' }))
    }

    if (!users.fields.getByName('status')) {
      users.fields.add(
        new SelectField({ name: 'status', values: ['active', 'inactive'], maxSelect: 1 }),
      )
    }

    users.deleteRule = "@request.auth.role = 'gerente' || @request.auth.role = 'Gerente'"

    app.save(users)

    app
      .db()
      .newQuery("UPDATE users SET status = 'active' WHERE status = '' OR status IS NULL")
      .execute()
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('resignation_date')
    users.fields.removeByName('status')
    users.deleteRule = "id = @request.auth.id || @request.auth.role = 'gerente'"
    app.save(users)
  },
)
