import knex from './config/dbConfig';

export const createPlace = async (eve, cx, cb) => {
  try {
    await knex('PLACE_INFO')
    .insert({
      PLACE_NAME: eve.name
    });

    return { statusCode: 200, headers: {}, body: JSON.stringify({}), isBase64Encoded: false }
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false }    
  }
}