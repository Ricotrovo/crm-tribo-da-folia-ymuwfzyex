onRecordCreate((e) => {
  const num = e.record.getString('contract_number')

  if (!num || num.startsWith('CTR-')) {
    const result = new DynamicModel({ max_num: 0 })
    try {
      $app
        .db()
        .newQuery(
          "SELECT MAX(CAST(contract_number AS INTEGER)) as max_num FROM contracts WHERE contract_number GLOB '[0-9]*'",
        )
        .one(result)
    } catch (err) {
      // ignore empty table
    }

    let nextNum = result.max_num || 0
    if (nextNum < 8000) {
      nextNum = 8000
    } else {
      nextNum += 1
    }

    e.record.set('contract_number', nextNum.toString())
  }

  if (!e.record.getString('status')) {
    e.record.set('status', 'draft')
  }

  e.next()
}, 'contracts')
