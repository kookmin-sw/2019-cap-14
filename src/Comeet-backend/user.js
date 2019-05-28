// eslint-disable-next-line import/prefer-default-export
var AWS = require('aws-sdk');
import nodemailer from 'nodemailer'


function getRandomCode() {
  // 6 자리 수로 맞추도록.
  return Math.ceil(Math.random() * (100000 - 999999) + 999999);
}

/**
 * 사용자 회원 가입
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const createUser = async (event, context, cb) => {
  const data = event;

  const code = getRandomCode()
  const knex = require('./config/dbConfig');

  try {
    const user = await knex('MEMBER_INFO').insert({
      MBR_EMAIL: data.email,
      MBR_NAME: data.name,
      MBR_PWD: data.password,
    })

    console.log(user);
    
    await knex('AUTH_CODE_INFO').insert({ 'AUTH_EMAIL': data.email, 'AUTH_CODE': code });
  
    var mailOptions = {
      from: 'topbladep@gmail.com', // It can be changed at Amazon SES Configuration.
      subject: 'This is an email sent from a Commet for Authorization!',
      html: `<p>Authorization Code is ${code}</p>`, // Need to contain HTML Form Action.
      to: data.email,
    };

    var AWS = require('aws-sdk');
    AWS.config.update({ accessKeyId: process.env.AWS_KEY, secretAccessKey: process.env.AWS_SECRET, region: 'us-east-1'})
  
    var transporter = nodemailer.createTransport({
      SES: new AWS.SES(),
    });
    
    await transporter.sendMail(mailOptions);
  
    return { statusCode: 201, headers: {}, body: JSON.stringify({}), isBase64Encoded: false }
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false }
  }
};

/**
 * 인증 코드를 입력하여 회원 가입을 컨펌한다.
 * REQUESTED || CONFIRMED
 * @param {*} event
 * @param {*} context
 * @param {*} cb
 */
export const confirmSignUp = async (event, context, cb) => {
  const data = event;
  const knex = require('./config/dbConfig');

  try {
    const user = await knex('MEMBER_INFO')
      .where({
        MBR_IDX: data.queryStringParameters.id,
        MBR_EMAIL: data.queryStringParameters.email,
        MBR_AUTH_STATUS: 'REQUESTED'
      });

    if (Array.isArray(user) && user.length === 0) {
      return { 
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ 
          message: 'USER_NOT_EXISTS_OR_ALREADY_CONFIRMED',
        }),
        isBase64Encoded: false
      }
    }

    const authInfo = await knex('AUTH_CODE_INFO')
      .where({
        AUTH_EMAIL: data.queryStringParameters.email,
        AUTH_CODE: data.queryStringParameters.code,
      });

    if (Array.isArray(authInfo) && authInfo.length === 0) {
      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({
          message: 'AUTH_CODE_NOT_EXISTS',
        }),
        isBase64Encoded: false,
      }
    }

    await knex('MEMBER_INFO')
      .where({
        MBR_IDX: data.queryStringParameters.id,
        MBR_EMAIL: data.queryStringParameters.email,
      })
      .update('MBR_AUTH_STATUS', 'CONFIRMED');

    return { statusCode: 200, headers: {}, body: JSON.stringify({}), isBase64Encoded: false }
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false }    
  }
}

/**
 * 사용자 로그인
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const fetchUser = async (event, context, cb) => {
  const data = event;
  const knex = require('./config/dbConfig');
  
  try {
    const user = await knex('MEMBER_INFO')
      .where({
        MBR_EMAIL: data.email,
        MBR_PWD: data.password,
        MBR_AUTH_STATUS: 'CONFIRMED',
      })
      .select();

    return { statusCode: 200, headers: {}, body: JSON.stringify({ user: user[0] }), isBase64Encoded: false }    
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false } 
  } 
}