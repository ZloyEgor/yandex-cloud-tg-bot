import {wishlistRepository, WishlistWithItems} from "../repository/wishlist";

export const wishlistService = {
  selectWishlistsWithItemsByUserId: async (userId: number) => {
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
  }
}