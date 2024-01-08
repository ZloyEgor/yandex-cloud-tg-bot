import {driver} from "../database";

export const userRepository = {
    createUser: async (id: number, userName: string) => {
        console.log(`creating user: id is ${id}, userName is ${userName}`);
        const query =
            `upsert into users (id, name) values (${id}, "${userName}");`;
        await driver.tableClient.withSession(async (session) => {
            await session.executeQuery(query);
        })
    }
}