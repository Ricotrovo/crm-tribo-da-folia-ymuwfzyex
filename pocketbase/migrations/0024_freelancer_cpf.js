migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('freelancers')
    if (!col.fields.getByName('cpf')) {
      col.fields.add(new TextField({ name: 'cpf' }))
    }
    col.addIndex('idx_freelancers_cpf_unique', true, 'cpf', "cpf != ''")
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('freelancers')
    col.removeIndex('idx_freelancers_cpf_unique')
    col.fields.removeByName('cpf')
    app.save(col)
  },
)
