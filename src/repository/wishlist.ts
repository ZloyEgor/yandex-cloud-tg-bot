import {v4 as uuidv4} from 'uuid';
import {driver} from "../database";

export type Wishlist = {
  id: string;
  userId: number;
  name: string;
  createdAt?: Date;
}

export const wishlistRepository = {
  createWishlist: async (userId: number, name: string) => {
    const query =
      `upsert into wishlist (id, name, user_id) values ("${uuidv4()}", "${name}", ${userId});`;

    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(query);
    })
  },

  checkIfWishlistExists: async (userId: number, name: string) => new Promise((resolve) => {
    const query =
      `select count(id) from wishlist where user_id = ${userId} and name = "${name}"`;

    driver.tableClient.withSession(async (session) => {
      const result = await session.executeQuery(query).then(r => r.resultSets[0]);
      resolve(result.rows?.at(0)?.items?.at(0)?.uint64Value >= 1)
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

  addElementToWishlist: async ({name, description, wishlistId}: {
    wishlistId: string;
    name: string;
    description?: string
  }) => {
    const query =
      `upsert into items (id, wishlist_id, name, description) values ('${uuidv4()}', '${wishlistId}', '${name}', ${description ? `"${description}"` : 'null'});`;

    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(query);
    })
  }
}
