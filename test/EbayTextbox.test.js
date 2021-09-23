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
import { render, screen } from '@testing-library/react';
import { EbayTextbox } from '../src/components/EbayTextbox/EbayTextbox';
import '@testing-library/jest-dom';

describe('EbayTextbox', () => {
    beforeAll(() => {
        global.fetch = require('node-fetch');
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({})
            })
        );
    });

    test('should render with no props', () => {
        render(<EbayTextbox />);
        expect(screen.getByTestId('ebay-textbox')).toBeInTheDocument();
    });

    test('should render with all the props', () => {
        const { debug } = render(
            <EbayTextbox
                label="Enter title or description"
                maxLength={100000}
                multiline={true}
                value="Test value"
                rows={10}
            />
        );
        expect(screen.getByTestId('ebay-textbox')).toBeInTheDocument();
        const textbox = screen.getByRole('textbox');

        expect(textbox.maxLength).toEqual(100000);
        expect(textbox.rows).toEqual(10);
        expect(textbox.value).toEqual('Test value');
    });
});
