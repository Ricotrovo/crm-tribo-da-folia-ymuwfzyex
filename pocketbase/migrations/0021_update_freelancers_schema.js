migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('freelancers')
    const categoriesCol = app.findCollectionByNameOrId('freelancer_categories')

    if (!col.fields.getByName('birth_date')) {
      col.fields.add(new TextField({ name: 'birth_date' }))
    }
    if (!col.fields.getByName('address_zip')) {
      col.fields.add(new TextField({ name: 'address_zip' }))
    }
    if (!col.fields.getByName('address_street')) {
      col.fields.add(new TextField({ name: 'address_street' }))
    }
    if (!col.fields.getByName('address_number')) {
      col.fields.add(new TextField({ name: 'address_number' }))
    }
    if (!col.fields.getByName('address_complement')) {
      col.fields.add(new TextField({ name: 'address_complement' }))
    }
    if (!col.fields.getByName('address_neighborhood')) {
      col.fields.add(new TextField({ name: 'address_neighborhood' }))
    }
    if (!col.fields.getByName('address_city')) {
      col.fields.add(new TextField({ name: 'address_city' }))
    }
    if (!col.fields.getByName('address_state')) {
      col.fields.add(new TextField({ name: 'address_state' }))
    }
    if (!col.fields.getByName('guardian_name_2')) {
      col.fields.add(new TextField({ name: 'guardian_name_2' }))
    }
    if (!col.fields.getByName('guardian_phone_2')) {
      col.fields.add(new TextField({ name: 'guardian_phone_2' }))
    }
    if (!col.fields.getByName('categories')) {
      col.fields.add(
        new RelationField({ name: 'categories', collectionId: categoriesCol.id, maxSelect: 999 }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('freelancers')
    col.fields.removeByName('birth_date')
    col.fields.removeByName('address_zip')
    col.fields.removeByName('address_street')
    col.fields.removeByName('address_number')
    col.fields.removeByName('address_complement')
    col.fields.removeByName('address_neighborhood')
    col.fields.removeByName('address_city')
    col.fields.removeByName('address_state')
    col.fields.removeByName('guardian_name_2')
    col.fields.removeByName('guardian_phone_2')
    col.fields.removeByName('categories')
    app.save(col)
  },
)
