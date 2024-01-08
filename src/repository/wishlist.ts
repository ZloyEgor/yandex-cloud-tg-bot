import {v4 as uuidv4} from 'uuid';
import {driver} from "../database";
import {Ydb} from "ydb-sdk";

export type Wishlist = {
  id: string;
  userId: number;
  name: string;
  createdAt?: Date;
}

export type WishlistItem = {
  id: string;
  wishlistId: string;
  name: string;
  description?: string;
}

export type WishlistWithItems = Wishlist & {
  items: WishlistItem[];
}

export const wishlistRepository = {
  createWishlist: async (userId: number, name: string) => {
    const query =
      `upsert into wishlist (id, name, user_id) values ("${uuidv4()}", "${name}", ${userId});`;

    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(query);
    })
  },

  checkIfWishlistExists: async (userId: number, name: string) => new Promise<boolean>((resolve) => {
    const query =
      `select count(id) from wishlist where user_id = ${userId} and name = "${name}"`;

    driver.tableClient.withSession(async (session) => {
      const result = await session.executeQuery(query).then(r => r.resultSets[0]);
      resolve(result.rows?.at(0)?.items?.at(0)?.uint64Value >= 1)
    })
  }),

  selectWishlistByUserIdAndWishlistName: async (userId: number, wishlistName: string) => new Promise<Wishlist | undefined>(resolve => {
    const query = `select id, user_id, name from wishlist where user_id = ${userId} and name = "${wishlistName}";`;
    driver.tableClient.withSession(async (session) => {
      const result = await session.executeQuery(query).then(r => r.resultSets[0]);

      if (result.rows?.length && result.rows.length > 0) {
        const row = result.rows?.at(0) as Ydb.IValue;
        const wishlist = {
          id: row.items!.at(0)!.bytesValue!.toString(),
          userId: row.items!.at(1)!.uint64Value,
          name: row.items!.at(2)!.bytesValue!.toString()
        };
        resolve(wishlist);
      } else
        resolve(undefined);
    })
  }),

  selectWishlistsByUserId: async (userId: number) => new Promise<Wishlist[]>(resolve => {
    const query = `select id, user_id, name from wishlist where user_id = ${userId};`;
    driver.tableClient.withSession(async (session) => {
      const result = await session.executeQuery(query).then(r => r.resultSets[0]);

      const wishlists: Wishlist[] = result.rows?.map(row => ({
        id: row.items!.at(0)!.bytesValue!.toString(),
        userId: row.items!.at(1)!.uint64Value,
        name: row.items!.at(2)!.bytesValue!.toString()
      })) || [];

      resolve(wishlists);
    })
  }),

  addItemToWishlist: async ({name, description, wishlistId}: Omit<WishlistItem, "id">) => {
    const query =
      `upsert into items (id, wishlist_id, name, description) values ('${uuidv4()}', '${wishlistId}', '${name}', ${description ? `"${description}"` : 'null'});`;

    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(query);
    })
  },

  deleteItemFromWishlist: async ({name, wishlistId}: Omit<WishlistItem, 'id' | 'description'>) => {
    const query =
      `delete from items where name = "${name}" and wishlist_id = "${wishlistId}"`;

    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(query);
    });
  },

  selectItemsOfWishlist: async (wishlistId: string) => new Promise<WishlistItem[]>(resolve => {
    const query =
      `select id, name, decription, wishlist_id from items where wishlist_id = "${wishlistId}"`;

    driver.tableClient.withSession(async (session) => {
      const result = await session.executeQuery(query).then(r => r.resultSets[0]);


      const items: WishlistItem[] = result.rows?.map(row => ({
        id: row.items!.at(0)!.bytesValue!.toString(),
        name: row.items!.at(1)!.bytesValue!.toString(),
        description: row.items!.at(2)?.bytesValue?.toString(),
        wishlistId: row.items!.at(3)!.bytesValue!.toString(),
      })) || [];

      resolve(items);
    })
  }),

  selectItemsOfUser: async (userId: number) => new Promise<WishlistItem[]>(resolve => {
    const query =
      `select items.id, items.name, items.description, wishlist_id from items 
        inner join wishlist on items.wishlist_id = wishlist.id 
        inner join users on users.id = wishlist.user_id
        where users.id = ${userId};`;

    driver.tableClient.withSession(async (session) => {
      const result = await session.executeQuery(query).then(r => r.resultSets[0]);
      const items: WishlistItem[] = result.rows?.map(row => ({
        id: row.items!.at(0)!.bytesValue!.toString(),
        name: row.items!.at(1)!.bytesValue!.toString(),
        description: row.items!.at(2)?.bytesValue?.toString(),
        wishlistId: row.items!.at(3)!.bytesValue!.toString(),
      })) || [];

      resolve(items);
    })
  }),

  deleteWishlist: async (wishlistId: string) => {
    const query =
      `delete from items where wishlist_id="${wishlistId}";` +
      `delete from wishlist where id="${wishlistId}";`;

    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(query);
    });

  }
}
