// ORM (Object-Relational Mapper library)
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:__dirname+'./../.env'});
const _ = require('lodash');
const { noRoleError } = require('../errors/error');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      ssl: false
    },
    //operatorsAliases: false,
    pool: { max: 5, min: 0, acquire: 300000, idle: 10000 },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true
    },
    //logging:false
  }
);

sequelize
.authenticate()
.then(() => {
  console.log('connected to POSTGRES database');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

const User = sequelize.define('user', {
  first: { type: Sequelize.STRING },
  last: { type: Sequelize.STRING },
  username: { type: Sequelize.STRING },
  email: { type: Sequelize.STRING, unique: true },
  password: { type: Sequelize.STRING },
  roles: { type: Sequelize.STRING },
},
{
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

const loginUser_C = input => {
  //console.log(input)
  return User.findOne({
    where: { email: input.email, password: input.password }
  }).then(res => {
    //console.log("we have results")
    //console.log(res)
    if(res) {
      //console.log("This has data")
      //console.log(res)
      return [{
        password: jwt.sign(
          { id: res.dataValues.id, email: res.dataValues.email, username: res.dataValues.username },
          process.env.JWT_SECRET,
          { expiresIn: '3d' }
        )
      }]
    } // if
  }) // then
  // do not feed password back to query, password stays in database
}

const addUser_C = input => {
  input.roles = ["view"]; // assign a dummy roles at first time user is created
  let user = new User(input);
  return User.findOne({
    where: { email: input.email }
  }).then((res) => {
    if(res) {
      return {first:"", last:"", username:"",email:"", password: "", roles:""};
    } else {
      return User.create({ first:input.first, last:input.last, username: input.username, email: input.email, password: input.password, roles: input.roles.join(",") })
         .then(res => {
            // res.dataValues.roles = res.dataValues.roles.split(',')
            return res.dataValues
          })
    }
  });
}


module.exports = {
  User,
  loginUser_C,
  addUser_C
};
