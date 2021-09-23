/*
 * *
 *  * Copyright 2021 eBay Inc.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *  http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *  *
 */

const xss = require('xss');
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const EbayAuthToken = require('ebay-oauth-nodejs-client');
const options = require('./options');

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 3001;
const apiBaseUrl =
    options.ENVIRONMENT === 'SANDBOX' ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
const oAuthTokenError = {
    data: {
        errors: [
            {
                errorId: 0,
                domain: 'TOKEN_ERROR',
                category: 'REQUEST',
                message: 'OAuth token generation failed'
            }
        ]
    }
};
const ebayAuthToken = new EbayAuthToken({
    clientId: options.CLIENT_ID,
    clientSecret: options.CLIENT_SECRET,
    env: options.ENVIRONMENT,
    redirectUri: ''
});

app.use(cors());
app.use(express.json());

const getAppToken = async () => {
    try {
        const token = await ebayAuthToken.getApplicationToken(options.ENVIRONMENT);
        return token && JSON.parse(token);
    } catch (error) {
        console.error(error);
    }
};

const makeApiCall = async (oAuthToken, apiURL, method, payload) => {
    const requestConfig = {
        method: method,
        url: apiURL,
        headers: {
            Authorization: `Bearer ${oAuthToken}`,
            'Content-Type': 'application/json'
        }
    };

    if (method === 'POST') {
        requestConfig.data = payload;
    }

    return await axios(requestConfig);
};

const callTranslationApi = async (oAuthToken, translationOptions, text, translationContext) => {
    let translateApiUrl = `${apiBaseUrl}/commerce/translation/v1_beta/translate`;

    try {
        return await makeApiCall(oAuthToken, translateApiUrl, 'POST', {
            from: translationOptions.from,
            to: translationOptions.to,
            text: [text],
            translationContext: translationContext
        });
    } catch (error) {
        return error.response;
    }
};

const triggerTranslationById = async (oAuthToken, translationOptions) => {
    let apiURL = `${apiBaseUrl}/buy/browse/v1/item/`;

    if (translationOptions.itemId) {
        apiURL = apiURL + translationOptions.itemId;
    } else if (translationOptions.listingId) {
        apiURL = `${apiURL}get_item_by_legacy_id?legacy_item_id=${translationOptions.listingId}`;
    }

    try {
        const apiResponse = await makeApiCall(oAuthToken, apiURL, 'GET', null);

        if (apiResponse && apiResponse.data && apiResponse.data.itemId) {
            const promises = [
                callTranslationApi(
                    oAuthToken,
                    translationOptions,
                    apiResponse.data.title,
                    'ITEM_TITLE'
                ),
                callTranslationApi(
                    oAuthToken,
                    translationOptions,
                    apiResponse.data.description,
                    'ITEM_DESCRIPTION'
                )
            ];

            const [titleTranslationResponse, descriptionTranslationResponse] = await Promise.all(
                promises
            );

            return {
                data: {
                    title: titleTranslationResponse.data,
                    description: descriptionTranslationResponse.data
                }
            };
        } else {
            return apiResponse;
        }
    } catch (error) {
        console.error(error);
        if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.errors &&
            error.response.data.errors[0] &&
            error.response.data.errors[0].errorId === 11006 &&
            error.response.data.errors[0].parameters[0].name === 'itemGroupHref'
        ) {
            // Its an item group ID
            const url = error.response.data.errors[0].parameters[0].value;
            const itemGroupResponse = await makeApiCall(oAuthToken, url, 'GET', null);

            if (
                itemGroupResponse &&
                itemGroupResponse.data &&
                itemGroupResponse.data.items &&
                itemGroupResponse.data.items.length > 0
            ) {
                const promises = [
                    callTranslationApi(
                        oAuthToken,
                        translationOptions,
                        (translationOptions.text = itemGroupResponse.data.items[0].title),
                        'ITEM_TITLE'
                    ),
                    callTranslationApi(
                        oAuthToken,
                        translationOptions,
                        (translationOptions.text =
                            itemGroupResponse.data.commonDescriptions[0].description),
                        'ITEM_DESCRIPTION'
                    )
                ];
                const [titleTranslationResponse, descriptionTranslationResponse] =
                    await Promise.all(promises);
                return {
                    data: {
                        title: titleTranslationResponse.data,
                        description: descriptionTranslationResponse.data
                    }
                };
            }
        } else {
            return error.response;
        }
    }
};

const translate = async (translationOptions) => {
    // Get the OAuth token
    const tokenResponse = await getAppToken();

    translationOptions.to = xss(translationOptions.to);
    translationOptions.from = xss(translationOptions.from);
    translationOptions.text = xss(translationOptions.text);
    translationOptions.translationContext = xss(translationOptions.translationContext);

    if (tokenResponse && tokenResponse.access_token) {
        // If an item/listing ID is passed, make a Browse API call
        if (translationOptions.itemId || translationOptions.listingId) {
            return await triggerTranslationById(tokenResponse.access_token, translationOptions);
        } else {
            return await callTranslationApi(
                tokenResponse.access_token,
                translationOptions,
                translationOptions.text,
                translationOptions.translationContext
            );
        }
    } else {
        return oAuthTokenError;
    }
};

router.post('/translate', (req, res) => {
    translate(req.body)
        .then((response) => res.status(200).send(response.data))
        .catch((error) => {
            console.error(error);
            res.status(500);
        });
});

app.use(router);

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

app.listen(PORT, console.log(`App is running, server is listening on port ${PORT}`));
