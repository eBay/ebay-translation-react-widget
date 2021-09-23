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

import React from 'react';
import 'babel-polyfill';
import '@testing-library/jest-dom';
import Adapter from 'enzyme-adapter-react-16';
import user from '@testing-library/user-event';

import { configure } from 'enzyme';
import { render, screen, waitFor } from '@testing-library/react';

import EbayTranslationWidget from '../index';

const testData = require('./test.data.json');

global.fetch = require('node-fetch');
configure({ adapter: new Adapter() });

describe('EbayTranslationWidget', () => {
    describe('When translating by text', () => {
        test('should render with no props', () => {
            render(<EbayTranslationWidget backendEndpoint="http://localhost:3001/translate" />);

            expect(screen.getByDisplayValue('en')).toBeInTheDocument();
            expect(screen.getByDisplayValue('de')).toBeInTheDocument();
            expect(screen.queryByText('Enter item/listing ID')).toBeNull();
            expect(screen.getAllByTestId('ebay-textbox').length).toEqual(2);
            expect(screen.getByTestId('translate-button')).toBeInTheDocument();
            expect(screen.getByDisplayValue('ITEM_TITLE')).toBeInTheDocument();
            expect(screen.getByLabelText('Enter title or description')).toBeInTheDocument();
        });

        test('should trigger title translation and render result in the right textbox', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => testData.TITLE_TRANSLATE
                })
            );

            render(<EbayTranslationWidget backendEndpoint="http://localhost:3001/translate" />);

            const input = screen.getAllByRole('textbox')[0];
            user.type(input, 'This is a test title');

            screen.getByTestId('translate-button').click();

            await waitFor(() => {
                screen.getByText(testData.TITLE_TRANSLATE.translations[0].translatedText);
            });
        });

        test('should trigger description translation and render result in the right textbox', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => testData.DESCRIPTION_TRANSLATE
                })
            );

            render(<EbayTranslationWidget backendEndpoint="http://localhost:3001/translate" />);

            const input = screen.getAllByRole('textbox')[0];
            user.type(input, 'This is a test description');

            screen.getByTestId('translate-button').click();

            await waitFor(() => {
                screen.getByText("Il s'agit d’une description de test");
            });
        });

        test('should show an error message when input is empty', async () => {
            render(<EbayTranslationWidget backendEndpoint="http://localhost:3001/translate" />);
            screen.getByTestId('translate-button').click();

            await waitFor(() => {
                screen.getByText('Please provide a valid input');
            });
        });

        test('should show an error message when Translation API fails', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => testData.TRANSLATION_API_ERROR
                })
            );

            render(<EbayTranslationWidget backendEndpoint="http://localhost:3001/translate" />);

            const input = screen.getAllByRole('textbox')[0];
            user.type(input, 'This is a <b>test</b>');

            screen.getByTestId('translate-button').click();

            await waitFor(() => {
                screen.getByText(
                    'Markups are not supported in input texts for title translation context.'
                );
            });
        });

        test('should override error message when prop is passed', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => testData.TRANSLATION_API_ERROR
                })
            );

            render(
                <EbayTranslationWidget
                    backendEndpoint="http://localhost:3001/translate"
                    errorMessage="Something is not working"
                />
            );

            const input = screen.getAllByRole('textbox')[0];
            user.type(input, 'This is a <b>test</b>');

            screen.getByTestId('translate-button').click();

            await waitFor(() => {
                screen.getByText('Something is not working');
            });
        });
    });

    describe('When translating by eBay item number', () => {
        beforeEach(() => {
            render(<EbayTranslationWidget backendEndpoint="http://localhost:3001/translate" />);
            screen.getByLabelText('Translate by ID').click();
        });

        test('should render with no props', () => {
            expect(screen.getByTestId('translate-button')).toBeInTheDocument();
            expect(screen.getByDisplayValue('en')).toBeInTheDocument();
            expect(screen.getByDisplayValue('de')).toBeInTheDocument();
            expect(screen.queryByText('ITEM_TITLE')).toBeNull();
            expect(screen.queryByText('Enter title or description')).toBeNull();
            expect(screen.getByLabelText('Enter item/listing ID')).toBeInTheDocument();
        });

        test('should show title and description translations', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => testData.TRANSLATE_BY_ID
                })
            );

            const input = screen.getAllByRole('textbox')[0];
            user.type(input, '123456789');

            await waitFor(() => {
                screen.getByTestId('translate-button').click();
            });

            const textboxes = screen.getAllByRole('textbox');
            const originalTitle = textboxes[textboxes.length - 4];
            const translatedTitle = textboxes[textboxes.length - 3];
            const originalDescription = textboxes[textboxes.length - 2];
            const translatedDescription = textboxes[textboxes.length - 1];

            expect(originalTitle.value).toEqual(
                testData.TRANSLATE_BY_ID.title.translations[0].originalText
            );
            expect(translatedTitle.value).toEqual(
                testData.TRANSLATE_BY_ID.title.translations[0].translatedText
            );
            expect(originalDescription.value).toEqual(
                testData.TRANSLATE_BY_ID.description.translations[0].originalText
            );
            expect(translatedDescription.value).toEqual(
                testData.TRANSLATE_BY_ID.description.translations[0].translatedText
            );
        });

        test('should show title translation even when description translation fails', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => testData.TRANSLATE_BY_ID__DESCRIPTION_ERR
                })
            );

            const input = screen.getAllByRole('textbox')[0];
            user.type(input, '123456789');

            await waitFor(() => {
                screen.getByTestId('translate-button').click();
            });

            const textboxes = screen.getAllByRole('textbox');
            const originalTitle = textboxes[textboxes.length - 4];
            const translatedTitle = textboxes[textboxes.length - 3];

            expect(originalTitle.value).toEqual(
                testData.TRANSLATE_BY_ID__DESCRIPTION_ERR.title.translations[0].originalText
            );
            expect(translatedTitle.value).toEqual(
                testData.TRANSLATE_BY_ID__DESCRIPTION_ERR.title.translations[0].translatedText
            );
            screen.getByText(
                'Maximum length of input text reached. For more information, see the API call reference documentation.'
            );
        });

        test('should show an error message when Browse API fails', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    json: () => testData.BROWSE_API_ERROR
                })
            );

            const input = screen.getAllByRole('textbox')[0];
            user.type(input, '123456789');

            screen.getByTestId('translate-button').click();

            await waitFor(() => {
                screen.getByText('The specified legacy item Id was not found.');
            });
        });
    });
});
