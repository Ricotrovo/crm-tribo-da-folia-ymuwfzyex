migrate((app) => {
  try {
    app
      .db()
      .newQuery('UPDATE contracts SET duration = 4 WHERE duration IS NULL OR duration = 0')
      .execute()
  } catch (e) {}

  try {
    app
      .db()
      .newQuery("UPDATE contracts SET status = 'active' WHERE status = '' OR status IS NULL")
      .execute()
  } catch (e) {}
})
