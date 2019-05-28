const mysql = require('mysql');
const fs = require('fs');

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'capstone-commet.cakjkbpdohs9.ap-northeast-2.rds.amazonaws.com',
    user : 'capstone',
    password : 'qkrdmsghks',
    database : 'commet',
  },
});

// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host : 'localhost',
//     user : 'root',
//     password : '',
//     database : 'capstone'
//   },
//   ssl: {
//     ca: '../rds-ca-2015-root.pem'
//   }
// });

module.exports = knex;
