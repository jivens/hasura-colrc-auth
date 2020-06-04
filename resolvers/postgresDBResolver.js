const jwt = require('jsonwebtoken');
const { AuthorizationError, noInputError } = require('../errors/error');


function checkToken(context) {
  console.log(context.headers)
  const token = context.headers.authorization;
  if (!token) {
    throw new AuthorizationError({
      message: `You must supply a JWT for authorization!`
    });
  } else if (token == null) {
    throw new AuthorizationError({
      message: `Username or Password is invalid`
    })
  }
  const decoded = jwt.verify(
    token.replace('Bearer ', ''),
    process.env.JWT_PRIVATE_KEY,
    { algorithms: ["RS256"] }
  );
  return decoded;
}

const loginUser_R = (input, connectorQuery) => {
  if(!input) {
    throw new noInputError({
      message: `You must supply a valid Input!`
  });
}
  return connectorQuery.apply(this, [input]);
};

const getUserFromToken_R = (context,input,connectorQuery) => {
  input["myid"] = checkToken(context).id;
  return connectorQuery.apply(this, [input]);
};

const addUser_R = (input, connectorQuery) => {
  if(!input) {
    throw new noInputError({
      message: `You must supply a valid Input!`
  });
}
  return connectorQuery.apply(this, [input]);
};

module.exports = {
  loginUser_R,
  addUser_R,
  getUserFromToken_R
};
