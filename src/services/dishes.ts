import pb from '@/lib/pocketbase/client'

export const getDishes = () => pb.collection('dishes').getFullList({ sort: '-created' })

export const createDish = (data: any) => pb.collection('dishes').create(data)

export const updateDish = (id: string, data: any) => pb.collection('dishes').update(id, data)

export const deleteDish = (id: string) => pb.collection('dishes').delete(id)

export const getDishIngredients = (dishId: string) =>
  pb.collection('dish_ingredients').getFullList({
    filter: `dish_id = "${dishId}"`,
    expand: 'item_id',
  })

export const createDishIngredient = (data: any) => pb.collection('dish_ingredients').create(data)

export const updateDishIngredient = (id: string, data: any) =>
  pb.collection('dish_ingredients').update(id, data)

export const deleteDishIngredient = (id: string) => pb.collection('dish_ingredients').delete(id)

export const getEventDishes = (eventId: string) =>
  pb.collection('event_dishes').getFullList({
    filter: `event_id = "${eventId}"`,
    expand: 'dish_id',
  })

export const createEventDish = (data: any) => pb.collection('event_dishes').create(data)

export const deleteEventDish = (id: string) => pb.collection('event_dishes').delete(id)
