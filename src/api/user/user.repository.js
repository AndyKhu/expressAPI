const db = require("../../utils/db")
const bcrypt = require('bcrypt');

const findUserByUsername = (username) => {
    return db.user.findFirst({
        where: {
            username: username
        }
    })
}

const createUser = (user) => {
    user.password = bcrypt.hashSync(user.password, 12);
    return db.user.create({
      data: user,
    });
}

const findUserById = (id) => {
    return db.user.findUnique({
        where: {
        id,
        },
    });
}

module.exports = {
    findUserByUsername,
    createUser,
    findUserById
}