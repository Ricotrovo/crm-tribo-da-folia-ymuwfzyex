migrate(
  (app) => {
    const suppliers = app.findCollectionByNameOrId('suppliers')

    const s1 = new Record(suppliers)
    s1.set('name', 'Balloons & Co')
    s1.set('contact_person', 'John Doe')
    s1.set('phone', '11999999999')
    app.save(s1)

    const s2 = new Record(suppliers)
    s2.set('name', 'Festive Tables')
    s2.set('contact_person', 'Jane Smith')
    s2.set('email', 'jane@festive.com')
    app.save(s2)

    const categories = app.findCollectionByNameOrId('item_categories')

    const c1 = new Record(categories)
    c1.set('name', 'Balloons')
    c1.set('type', 'product')
    app.save(c1)

    const c2 = new Record(categories)
    c2.set('name', 'Decoration')
    c2.set('type', 'service')
    app.save(c2)

    const items = app.findCollectionByNameOrId('items')

    const i1 = new Record(items)
    i1.set('name', 'Latex Balloon Size 9 Blue')
    i1.set('type', 'product')
    i1.set('category_id', c1.id)
    i1.set('supplier_id', s1.id)
    i1.set('unit', 'package')
    i1.set('color', 'Blue')
    i1.set('size', '9')
    i1.set('base_price', 15.0)
    i1.set('additional_price', 0)
    i1.set('stock_quantity', 100)
    app.save(i1)

    const i2 = new Record(items)
    i2.set('name', 'Themed Table Decoration Service')
    i2.set('type', 'service')
    i2.set('category_id', c2.id)
    i2.set('supplier_id', s2.id)
    i2.set('base_price', 500.0)
    i2.set('additional_price', 50.0)
    app.save(i2)
  },
  (app) => {
    try {
      const items = app.findRecordsByFilter(
        'items',
        "name = 'Latex Balloon Size 9 Blue' || name = 'Themed Table Decoration Service'",
      )
      for (const r of items) app.delete(r)
    } catch (e) {}

    try {
      const cats = app.findRecordsByFilter(
        'item_categories',
        "name = 'Balloons' || name = 'Decoration'",
      )
      for (const r of cats) app.delete(r)
    } catch (e) {}

    try {
      const sups = app.findRecordsByFilter(
        'suppliers',
        "name = 'Balloons & Co' || name = 'Festive Tables'",
      )
      for (const r of sups) app.delete(r)
    } catch (e) {}
  },
)
