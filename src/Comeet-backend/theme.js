import knex from './config/dbConfig';

export const createTheme = async (eve, cx, cb) => {
  try {
    await knex('THEME_INFO')
    .insert({
      THEME_NAME: eve.name
    });

    return { statusCode: 200, headers: {}, body: JSON.stringify({}), isBase64Encoded: false }
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false }    
  }
}