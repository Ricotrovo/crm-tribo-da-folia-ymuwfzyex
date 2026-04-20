migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'r.trovo@gmail.com')
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('r.trovo@gmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin CRM')
      admin.set('role', 'admin')
      app.save(admin)
    }

    const leadsCol = app.findCollectionByNameOrId('leads')
    try {
      app.findFirstRecordByData('leads', 'name', 'João Silva')
    } catch (_) {
      const lead1 = new Record(leadsCol)
      lead1.set('name', 'João Silva')
      lead1.set('status', 'Novo')
      lead1.set('profile_id', admin.id)
      app.save(lead1)

      const lead2 = new Record(leadsCol)
      lead2.set('name', 'Maria Oliveira')
      lead2.set('status', 'Proposta')
      lead2.set('profile_id', admin.id)
      app.save(lead2)
    }

    const eventsCol = app.findCollectionByNameOrId('events')
    try {
      app.findFirstRecordByData('events', 'title', 'Aniversário João')
    } catch (_) {
      const d = new Date()
      const today = d.toISOString().split('T')[0]

      const event1 = new Record(eventsCol)
      event1.set('title', 'Aniversário João')
      event1.set('date', today)
      event1.set('time', '13:00')
      event1.set('salon', 'Premium')
      event1.set('client_name', 'João Pai')
      event1.set('guests', 50)
      event1.set('menu', 'Standard')
      event1.set('profile_id', admin.id)
      app.save(event1)

      const event2 = new Record(eventsCol)
      event2.set('title', 'Festa Maria')
      event2.set('date', today)
      event2.set('time', '19:00')
      event2.set('salon', 'Kids&Teens')
      event2.set('client_name', 'Maria Mãe')
      event2.set('guests', 100)
      event2.set('menu', 'VIP')
      event2.set('profile_id', admin.id)
      app.save(event2)
    }

    const contractsCol = app.findCollectionByNameOrId('contracts')
    let contract1
    try {
      contract1 = app.findFirstRecordByData('contracts', 'total_value', 5000)
    } catch (_) {
      contract1 = new Record(contractsCol)
      contract1.set('client_id', admin.id)
      contract1.set('total_value', 5000)
      app.save(contract1)

      const contract2 = new Record(contractsCol)
      contract2.set('client_id', admin.id)
      contract2.set('total_value', 3000)
      app.save(contract2)
    }

    const paymentsCol = app.findCollectionByNameOrId('payments')
    try {
      app.findFirstRecordByData('payments', 'amount', 2500)
    } catch (_) {
      const payment1 = new Record(paymentsCol)
      payment1.set('contract_id', contract1.id)
      payment1.set('amount', 2500)
      payment1.set('status', 'Pendente')
      app.save(payment1)

      const payment2 = new Record(paymentsCol)
      payment2.set('contract_id', contract1.id)
      payment2.set('amount', 2500)
      payment2.set('status', 'Pago')
      app.save(payment2)
    }
  },
  (app) => {
    app.truncateCollection(app.findCollectionByNameOrId('payments'))
    app.truncateCollection(app.findCollectionByNameOrId('contracts'))
    app.truncateCollection(app.findCollectionByNameOrId('events'))
    app.truncateCollection(app.findCollectionByNameOrId('leads'))
  },
)
