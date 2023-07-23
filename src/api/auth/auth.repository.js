const db = require("../../utils/db")
const { hashToken } = require("../../utils/hashToken");

const addRefreshTokenToWhitelist = ({ jti, refreshToken, userId }) => {
    return db.refreshToken.create({
      data: {
        id: jti,
        hashedToken: hashToken(refreshToken),
        userId
      },
    });
}

const findRefreshTokenById = (id) => {
    return db.refreshToken.findUnique({
        where: {
        id,
        },
    });
}

const deleteRefreshToken = (id) => {
    return db.refreshToken.update({
      where: {
        id,
      },
      data: {
        revoked: true
      }
    });
}

module.exports = {
    addRefreshTokenToWhitelist,
    findRefreshTokenById,
    deleteRefreshToken
}