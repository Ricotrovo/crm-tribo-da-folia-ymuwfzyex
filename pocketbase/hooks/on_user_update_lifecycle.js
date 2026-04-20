onRecordUpdate((e) => {
  const resDate = e.record.getString('resignation_date')
  const origResDate = e.record.original().getString('resignation_date')

  if (resDate && resDate !== origResDate) {
    e.record.set('status', 'inactive')
  } else if (!e.record.getString('status')) {
    e.record.set('status', 'active')
  }

  e.next()
}, 'users')
