migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('freelancers')
    col.fields.add(new TextField({ name: 'phone' }))
    col.fields.add(new TextField({ name: 'address' }))
    col.fields.add(
      new FileField({
        name: 'guardian_authorization',
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      }),
    )
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('freelancers')
    col.fields.removeByName('phone')
    col.fields.removeByName('address')
    col.fields.removeByName('guardian_authorization')
    app.save(col)
  },
)
