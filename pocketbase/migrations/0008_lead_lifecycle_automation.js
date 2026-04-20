migrate(
  (app) => {
    const d15 = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    const d22 = new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()

    app
      .db()
      .newQuery(`
    UPDATE leads
    SET status = 'Revisar'
    WHERE status NOT IN ('Fechado', 'Revisar', 'Clientes Adormecidos')
      AND (
        (last_contact_date != '' AND datetime(last_contact_date) <= datetime({:d15}))
        OR
        ((last_contact_date = '' OR last_contact_date IS NULL) AND datetime(created) <= datetime({:d15}))
      )
  `)
      .bind({ d15: d15 })
      .execute()

    app
      .db()
      .newQuery(`
    UPDATE leads
    SET status = 'Clientes Adormecidos'
    WHERE status = 'Revisar'
      AND (
        (last_contact_date != '' AND datetime(last_contact_date) <= datetime({:d22}))
        OR
        ((last_contact_date = '' OR last_contact_date IS NULL) AND datetime(created) <= datetime({:d22}))
      )
  `)
      .bind({ d22: d22 })
      .execute()
  },
  (app) => {
    // Irreversible changes without snapshots
  },
)
