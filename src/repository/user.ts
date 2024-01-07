import {driver} from "../database";

export const userRepository = {
    createUser: async (id, userName) => {
        console.log(`creating user: id is ${id}, userName is ${userName}`);
        const query =
            `upsert into users (id, name) values (${id}, "${userName}");`;
        // `upsert into users (id, name) values (1, 'posos');`;
        await driver.tableClient.withSession(async (session) => {
            await session.executeQuery(query);
        })
    }
}