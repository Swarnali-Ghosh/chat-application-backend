// function for create fake data
import { User } from '../models/user.js'
import { faker } from '@faker-js/faker'
const createUser = async (numUsers) => {
    try {
        const usersPromise = [];
        for (let i = 0; i < numUsers; i++) {

            const tempUser = User.create({
                name: faker.person.fullName(),
                username: faker.internet.userName(),
                bio: faker.lorem.sentence(10),
                password: "password",
                avatar: {
                    url: faker.image.avatar(),
                    public_id: faker.system.fileName()
                }
            });

            usersPromise.push(tempUser);
        }

        await Promise.all(usersPromise);

        // process.exit(1);

    } catch (error) {
        console.error(error);
        // close server
        // process.exit(1);
    }
}

export { createUser };