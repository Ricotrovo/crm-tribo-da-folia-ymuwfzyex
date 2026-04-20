cronAdd('lead_lifecycle', '0 0 * * *', () => {
  const d15 = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  const d22 = new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()

  const filter1 =
    "status != 'Fechado' && status != 'Revisar' && status != 'Clientes Adormecidos' && ((last_contact_date != '' && last_contact_date <= '" +
    d15 +
    "') || (last_contact_date = '' && created <= '" +
    d15 +
    "'))"

  try {
    const recordsToReview = $app.findRecordsByFilter('leads', filter1, '-created', 10000, 0)
    for (let i = 0; i < recordsToReview.length; i++) {
      const rec = recordsToReview[i]
      rec.set('status', 'Revisar')
      $app.saveNoValidate(rec)
    }
  } catch (e) {
    console.log('Error processing Revisar leads: ' + e)
  }

  const filter2 =
    "status = 'Revisar' && ((last_contact_date != '' && last_contact_date <= '" +
    d22 +
    "') || (last_contact_date = '' && created <= '" +
    d22 +
    "'))"

  try {
    const recordsToDormant = $app.findRecordsByFilter('leads', filter2, '-created', 10000, 0)
    for (let i = 0; i < recordsToDormant.length; i++) {
      const rec = recordsToDormant[i]
      rec.set('status', 'Clientes Adormecidos')
      $app.saveNoValidate(rec)
    }
  } catch (e) {
    console.log('Error processing Clientes Adormecidos leads: ' + e)
  }
})
