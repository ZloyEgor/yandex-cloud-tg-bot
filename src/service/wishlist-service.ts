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

  getWishlist: async (userId: number, wishlistName: string) => {
    return await wishlistRepository.selectWishlistByUserIdAndWishlistName(userId, wishlistName);
  },

  deleteWishlist: async (wishlistId: string) => {
    await wishlistRepository.deleteWishlist(wishlistId);
  },

  getWishlistById: async (wishlistId: string, userId?: number): Promise<WishlistWithItems | undefined> => {
    const wishlist = await wishlistRepository.selectWishlistById(wishlistId);
    if (!wishlist) return;
    const items = await wishlistRepository.selectItemsOfWishlist(wishlist.id);
    return ({
      ...wishlist,
      items,
    })
  },

  bookItem: async (userId: number, wishlistId: string, itemName: string) => {

    // await wishlistRepository.bookItem()
  }
}