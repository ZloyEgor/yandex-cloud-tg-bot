import { v4 as uuidv4 } from 'uuid';
import {driver} from "../database";

export const wishlistRepository = {
  createWishlist: async (userId: number, name: string) => {
    const query =
      `upsert into wishlist (id, name, user_id) values ("${uuidv4()}", "${name}", ${userId});`;

    console.log('query', query);
    await driver.tableClient.withSession(async (session) => {
      await session.executeQuery(query);
    })
  }
}
