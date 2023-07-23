const { findUserById } = require('./user.repository');

const checkProfile = async (userId) => {
    const user = await findUserById(userId);
    delete user.password;
    return user
}

module.exports = {
    checkProfile
}