onRecordCreate((e) => {
  const resDate = e.record.getString('resignation_date')

  if (resDate) {
    e.record.set('status', 'inactive')
  } else if (!e.record.getString('status')) {
    e.record.set('status', 'active')
  }

  e.next()
}, 'users')
