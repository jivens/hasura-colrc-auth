const { makeExecutableSchema } = require('graphql-tools');
require('dotenv').config({path:__dirname+'./../.env'});

const { 
  User,
  loginUser_C,
  addUser_C,
  getUserFromToken_C
} = require('../connectors/postgresDB');
const { // define resolvers
  loginUser_R,
  addUser_R,
  getUserFromToken_R
} = require('../resolvers/postgresDBResolver');

// passwrd field on type User shouldn't expose passwords
// instead is used to store json token after successfull login query - loginUser_Q
// it's ok to leave password at UserInput at Mutation

const typeDefs = `
  type User {
    id: ID!
    first: String!
    last: String!
    username: String!
    email: String!
    password: String!
  }
  type LoginUser {
    password: String!
  }
  type Token {
    token: String!
  }
  type Query {
    loginUser_Q(email:String!,password:String!): [LoginUser]
    getUserFromToken_Q: User
  }
  type Mutation {
    addUser_M(first:String!, last:String!, username:String!,email:String!,password:String!): User
  }
`;

const resolvers = {
  Query: {
    loginUser_Q: (_, args, context) => loginUser_R(args, loginUser_C),
    getUserFromToken_Q: (_, args, context) => getUserFromToken_R(context, args, getUserFromToken_C)
  },
  Mutation: {
    // first time user is created see - connector where a view role is inserted
    addUser_M: (_, args, context) => addUser_R(args,addUser_C)
  }
};

module.exports = new makeExecutableSchema({ typeDefs, resolvers });

