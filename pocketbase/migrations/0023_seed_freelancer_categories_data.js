migrate(
  (app) => {
    const categories = [
      { name: 'Garçom', pay_rate: 150 },
      { name: 'Monitor', pay_rate: 120 },
      { name: 'Segurança', pay_rate: 200 },
    ]

    const catCol = app.findCollectionByNameOrId('freelancer_categories')
    const catIds = []

    for (const c of categories) {
      try {
        const existing = app.findFirstRecordByData('freelancer_categories', 'name', c.name)
        catIds.push(existing.id)
      } catch (_) {
        const record = new Record(catCol)
        record.set('name', c.name)
        record.set('pay_rate', c.pay_rate)
        app.save(record)
        catIds.push(record.id)
      }
    }

    const freeCol = app.findCollectionByNameOrId('freelancers')
    try {
      app.findFirstRecordByData('freelancers', 'phone', '11999998888')
    } catch (_) {
      const record = new Record(freeCol)
      record.set('name', 'João Silva Exemplo')
      record.set('phone', '11999998888')
      record.set('status', 'Ativo')
      record.set('birth_date', '1995-05-15')
      record.set('address_zip', '01001-000')
      record.set('address_street', 'Praça da Sé')
      record.set('address_neighborhood', 'Sé')
      record.set('address_city', 'São Paulo')
      record.set('address_state', 'SP')
      record.set('categories', catIds)
      app.save(record)
    }
  },
  (app) => {},
)
