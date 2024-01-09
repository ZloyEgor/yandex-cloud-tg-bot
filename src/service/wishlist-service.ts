import {wishlistRepository, WishlistWithItems} from "../repository/wishlist";

export const wishlistService = {
  getWishlistsWithItemsByUserId: async (userId: number) => {
    const wishlists = await wishlistRepository.selectWishlistsByUserId(userId);
    const items = await wishlistRepository.selectItemsOfUser(userId);

    const wishlistsWithItems: WishlistWithItems[] = wishlists.map(w => ({
      ...w,
      items: items.filter(i => i.wishlistId === w.id)
    }))

    return wishlistsWithItems;
  },

  getWishlist: async (userId: number, wishlistName: string): Promise<WishlistWithItems | undefined> => {
    const wishlist = await wishlistRepository.selectWishlistByUserIdAndWishlistName(userId, wishlistName);
    if (!wishlist) return;
    const items = await wishlistRepository.selectItemsOfUser(userId);

    return {...wishlist, items: items.filter(i => i.wishlistId === wishlist.id)};
  },

  deleteWishlist: async (wishlistId: string) => {
    await wishlistRepository.deleteWishlist(wishlistId);
  },

  getWishlistById: async (wishlistId: string): Promise<WishlistWithItems | undefined> => {
    const wishlist = await wishlistRepository.selectWishlistById(wishlistId);
    if (!wishlist) return;
    const items = await wishlistRepository.selectItemsOfWishlist(wishlist.id);
    return ({
      ...wishlist,
      items,
    })
  },

  reserveItem: async (userId: number, wishlistId: string, itemName: string) => {
    const wishlist = await wishlistRepository.selectWishlistById(wishlistId);
    if (!wishlist) throw new Error('Указанный вишлист не найден');
    const items = await wishlistRepository.selectItemsOfWishlist(wishlist.id);
    const targetItem = items.find(item => item.name === itemName);
    if (!targetItem) throw new Error('Не удалось найти указанный элемент');
    if (targetItem.bookedBy) throw new Error('Указанный элемент уже забронирован!');
    await wishlistRepository.reserveItem(userId, targetItem.id);
  },

  cancelItemReserve: async (userId: number, wishlistId: string, itemName: string) => {
    const wishlist = await wishlistRepository.selectWishlistById(wishlistId);
    if (!wishlist) throw new Error('Указанный вишлист не найден');
    const items = await wishlistRepository.selectItemsOfWishlist(wishlist.id);
    const targetItem = items.find(item => item.name === itemName);
    if (!targetItem) throw new Error('Не удалось найти указанный элемент');
    if (targetItem.bookedBy !== userId) throw new Error('Указанный элемент забронирован другим пользователем');
    await wishlistRepository.deleteItemReserve(userId, targetItem.id);
  }
}