migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.updateRule = "@request.auth.id != ''"
    users.fields.add(new TextField({ name: 'role_title' }))
    users.fields.add(new NumberField({ name: 'salary' }))
    users.fields.add(new TextField({ name: 'admission_date' }))
    users.fields.add(new TextField({ name: 'vacation_info' }))
    users.fields.add(
      new SelectField({
        name: 'crm_access_level',
        values: ['none', 'basic', 'full'],
        maxSelect: 1,
      }),
    )
    app.save(users)

    const freelancers = app.findCollectionByNameOrId('freelancers')
    freelancers.fields.add(new TextField({ name: 'guardian_name' }))
    freelancers.fields.add(new TextField({ name: 'guardian_phone' }))
    freelancers.fields.add(new NumberField({ name: 'overall_rating' }))
    app.save(freelancers)

    const empDocs = new Collection({
      name: 'employee_documents',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'file',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        },
        { name: 'doc_type', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(empDocs)

    const freeRoles = new Collection({
      name: 'freelancer_roles',
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
          collectionId: freelancers.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'role_name', type: 'text', required: true },
        { name: 'pay_rate', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(freeRoles)

    const attLogs = new Collection({
      name: 'attendance_logs',
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
          collectionId: freelancers.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'date', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['scheduled', 'present', 'no_show'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(attLogs)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('attendance_logs'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('freelancer_roles'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('employee_documents'))
    } catch (e) {}

    const f = app.findCollectionByNameOrId('freelancers')
    if (f.fields.getByName('guardian_name')) f.fields.removeByName('guardian_name')
    if (f.fields.getByName('guardian_phone')) f.fields.removeByName('guardian_phone')
    if (f.fields.getByName('overall_rating')) f.fields.removeByName('overall_rating')
    app.save(f)

    const u = app.findCollectionByNameOrId('_pb_users_auth_')
    u.updateRule = 'id = @request.auth.id'
    if (u.fields.getByName('role_title')) u.fields.removeByName('role_title')
    if (u.fields.getByName('salary')) u.fields.removeByName('salary')
    if (u.fields.getByName('admission_date')) u.fields.removeByName('admission_date')
    if (u.fields.getByName('vacation_info')) u.fields.removeByName('vacation_info')
    if (u.fields.getByName('crm_access_level')) u.fields.removeByName('crm_access_level')
    app.save(u)
  },
)
