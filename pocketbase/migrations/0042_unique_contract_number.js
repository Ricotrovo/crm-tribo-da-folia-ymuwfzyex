migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')
    col.addIndex('idx_contracts_number_unique', true, 'contract_number', "contract_number != ''")
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('contracts')
    col.removeIndex('idx_contracts_number_unique')
    app.save(col)
  },
)
