import pb from '@/lib/pocketbase/client'

export const getMenus = () => pb.collection('menus').getFullList({ sort: 'name' })

export const createMenu = (data: any) => pb.collection('menus').create(data)

export const updateMenu = (id: string, data: any) => pb.collection('menus').update(id, data)

export const deleteMenu = (id: string) => pb.collection('menus').delete(id)

export const getMenuDishes = (menuId: string) =>
  pb.collection('menu_dishes').getFullList({
    filter: `menu_id = "${menuId}"`,
    expand: 'dish_id',
  })

export const createMenuDish = (data: any) => pb.collection('menu_dishes').create(data)

export const deleteMenuDish = (id: string) => pb.collection('menu_dishes').delete(id)

export const getMenuItems = (menuId: string) =>
  pb.collection('menu_items').getFullList({
    filter: `menu_id = "${menuId}"`,
    expand: 'item_id',
  })

export const createMenuItem = (data: any) => pb.collection('menu_items').create(data)

export const deleteMenuItem = (id: string) => pb.collection('menu_items').delete(id)
