// eslint-disable-next-line import/prefer-default-export

import knex from './config/dbConfig';
import AWS from 'aws-sdk';

/**
 * 파일 업로드
 * @param {*} event
 * @param {*} context
 * @param {*} cb
 */
export const uploadToS3 = async (event, context, cb) => {
  AWS.config.update({ accessKeyId: process.env.AWS_KEY, secretAccessKey: process.env.AWS_SECRET, region: 'us-east-1'})

  const { REGION: region, BUCKET_NAME: bucket } = process.env;

  if (!region || !bucket) {
    throw new Error('REGION and BUCKET environment variables are required!');
  }

  const S3 = new AWS.S3({ signatureVersion: 'v4', region });

  const file =
    event.headers && event.headers['x-amz-meta-filekey']
      ? event.headers['x-amz-meta-filekey']
      : undefined;

  if (!file) {
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify({
        message: 'Missing x-amz-meta-filekey in the header of the request.',
      }),
    };
  }

  const params = {
    Bucket: bucket,
    Key: file,
    Expires: 30,
  };

  try {
    const preSignedUrl = await S3.getSignedUrl('putObject', params);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify({ preSignedUrl }),
      isBase64Encoded: false
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify(error),
      headers: {},
      isBase64Encoded: false
    };
  }
}

/**
 * 게시글을 생성한다.
 * @param {*} event
 * @param {*} context
 * @param {*} cb
 */
export const createArticle = async (eve, cx, cb) => {
  return await knex.transaction(async (t) => {
    try {
      /**
       * event: {
       *  user: {},
       *  article: {},
       *  placeId,
       *  themeId
       * }
       */
      const user = await knex('MBR_INFO').where({ email: eve.user.email, passwword: eve.user.passwword }).first();
      // article theme, place 도 넣기.
      
      const articleData = eve.article;
      articleData.MBR_IDX = user.MBR_IDX;
      
      // 이미지 파일 경로는 이런 식으로 `https://s3.ap-northeast-2.amazonaws.com/capstone.images/${file}`
      const article = await knex('ARTICLE_INFO').insert(articleData).returning('*');

      await knex('ARTICLE_PLACE_INFO')
        .insert({
          ART_IDX: article[0],
          PLACE_IDX: eve.placeId,
        });
      
      await knex('ARTICLE_THEME_INFO')
        .insert({
          ART_IDX: article[0],
          THEME_IDX: eve.themeId,
        })
      
      await t.commit();

      return { statusCode: 201, headers: {}, body: JSON.stringify({}), isBase64Encoded: false };
    } catch (e) {
      await t.rollback(e);
      return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false };
    }
  });
}

/**
 * 게시글 좋아요 추가
 * @param {*} eve 
 * @param {*} cx 
 * @param {*} cb
 */
export const likeArticleById = async (eve, cx, cb) => {
  try {
    await knex('ARTICLE_INFO')
      .where('ART_IDX', '=', eve.pathParameters.id)
      .increment('ART_LIKE', 1);

    return { statusCode: 201, headers: {}, body: JSON.stringify({}), isBase64Encoded: false };
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false };
  }
}

/**
 * 게시글 좋아요 취소
 * @param {*} eve
 * @param {*} cx
 * @param {*} cb
 */
export const cancelLikeArticleById = async (eve, cx, cb) => {
  try {
    await knex('ARTICLE_INFO')
      .where('ART_IDX', '=', eve.pathParameters.id)
      .decrement('ART_LIKE', 1);
    
    return { statusCode: 201, headers: {}, body: JSON.stringify({}), isBase64Encoded: false };
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify(e), isBase64Encoded: false };
  }
}

/**
 * 게시글 조회
 * @param {*} eve
 * @param {*} cx
 * @param {*} cb
 */
export const fetchArticleById = async (eve, cx, cb) => {
  try {
    const article = await knex('ARTICLE_INFO')
      .where('ART_IDX', '=', eve.pathParameters.id)
      .select();

    await knex('ARTICLE_INFO')
      .where('ART_IDX', '=', eve.pathParameters.id)
      .increment('ART_VIEW', 1);

    return { statusCode: 200, headers: {}, body: JSON.stringify({ article }), isBase64Encoded: false };
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify({ e }), isBase64Encoded: false };
  }
}

/**
 * 게시글 검색
 * @param {*} eve
 * @param {*} cx
 * @param {*} cb
 */
export const searchArticles = async (eve, cx, cb) => {
  try {
    /**
     * Night / Days
     * themeId
     * sorting: ART_LIKE, ART_VIEW, ART_REG_DATE
     */
    if (eve.hasOwnProperty('themeId') === true) {
      const result = await knex('ARTICLE_INFO')
        .innerJoin('ARTICLE_THEME_INFO', 'ARTICLE_INFO.ART_IDX', 'ARTICLE_THEME_INFO.THEME_IDX')
        .where({
          ARTICLE_THEME_INFO: eve.themeId,
          ART_AVAIL_DAY: eve.nightDays,
        })
        .orderBy(eve.sorting, 'desc');

      return { statusCode: 200, headers: {}, body: JSON.stringify({ result }), isBase64Encoded: false };
    } else {
      const result = await knex('ARTICLE_INFO')
        .where({ ART_AVAIL_DAY: eve.nightDays })
        .orderBy(eve.sorting, 'desc');
      
      return { statusCode: 200, headers: {}, body: JSON.stringify({ result }), isBase64Encoded: false };
    }
  } catch (e) {
    return { statusCode: 200, headers: {}, body: JSON.stringify({ e }), isBase64Encoded: false };
  }
}