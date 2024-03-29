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

export const languageIdMap = {
    en: 'English',
    de: 'German',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    ja: 'Japanese',
    pt: 'Portuguese',
    ru: 'Russian',
    zh: 'Chinese'
};

export const supportedTranslations = [
    {
        name: 'en',
        supportedTranslations: ['de', 'zh', 'ja', 'fr', 'it', 'es', 'ru', 'pt']
    },
    {
        name: 'de',
        supportedTranslations: ['fr', 'it', 'es', 'en']
    },
    {
        name: 'fr',
        supportedTranslations: ['en', 'de', 'it', 'es']
    },
    {
        name: 'it',
        supportedTranslations: ['en', 'de', 'es', 'fr']
    },
    {
        name: 'es',
        supportedTranslations: ['en', 'de', 'fr', 'it']
    },
    {
        name: 'ja',
        supportedTranslations: ['en']
    },
    {
        name: 'zh',
        supportedTranslations: ['en']
    }
];
