
const Validator = require("fastest-validator");
const { findUserByUsername, createUser, findUserById } = require("../user/user.repository");
const v = new Validator();

const { generateTokens } = require("../../utils/jwt");
const { v4: uuidv4 } = require('uuid');
const { hashToken } = require("../../utils/hashToken");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addRefreshTokenToWhitelist, findRefreshTokenById, deleteRefreshToken } = require("./auth.repository");

const Register = async (user) => {
    const schema = {
        username : { type: "string", min: 5, max: 50, optional: false },
        name : { type: "string", min: 5, max: 50, optional: false },
        password : { type: "string", min: 5, max: 255, optional: false },
        gender : { type: "string", enum: ["female","male"] },
        role: { type: "string", default: "user" },
        status: { type: "boolean", default: true }
    }
    let data = {
        username: user.username,
        password: user.password,
        name: user.name,
        gender: user.gender,
        role: user.role,
        status: user.status
    }
    // validation
    const validationResult = v.validate(data,schema)
    if(validationResult != true)
        return {status: 400, err: "Validation Failed"}

    const existionUser = await findUserByUsername(user.username)
    if(existionUser)
        return {status: 400, err: "Username already exist"}

    // Create & save user to DB
    const userDB = await createUser(data)
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(userDB, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: userDB.id });
    
    return {status: 200, data: {accessToken, refreshToken}}
}

const Login = async (username,password)=>{
    const schema = {
        username : { type: "string", min: 5, max: 50, optional: false },
        password : { type: "string", min: 5, max: 255, optional: false }
    }
    const data = {
        username,
        password
    }

    // validation
    const validationResult = v.validate(data,schema)
    if(validationResult != true)
        return {status: 400, err: "Validation Failed"}

    const existingUser = await findUserByUsername(username);
    if (!existingUser)
        return {status: 403, err: "Invalid login credentials"}
    
    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword)
        return {status: 403, err: "Invalid login credentials"}
    
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });
    return {status: 200, data: {accessToken, refreshToken}}
}

const RefreshToken = async (refreshToken) => {
    if (!refreshToken)
        return {status: 400, err: "Missing refresh token."}
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);
    if (!savedRefreshToken || savedRefreshToken.revoked === true)
        return {status: 401, err: "Unauthorized1"}

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) 
        return {status: 401, err: "Unauthorized2"}
    
    const user = await findUserById(payload.userId);
    if (!user)
        return {status: 401, err: "Unauthorized3"}
    
    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });
    return {status: 200, data: {accessToken, refreshToken}}
}

module.exports = {
    Register,
    Login,
    RefreshToken
}