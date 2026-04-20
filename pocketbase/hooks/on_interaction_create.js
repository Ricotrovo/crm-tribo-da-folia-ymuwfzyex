onRecordAfterCreateSuccess((e) => {
  const leadId = e.record.getString('lead_id')
  if (!leadId) return e.next()

  const interactionDate = e.record.getString('interaction_date')
  const dateToUse = interactionDate ? interactionDate : new Date().toISOString()

  try {
    const lead = $app.findRecordById('leads', leadId)
    lead.set('last_contact_date', dateToUse)
    $app.save(lead)
  } catch (err) {
    console.log('Failed to update lead last_contact_date: ' + err)
  }

  return e.next()
}, 'interactions')
