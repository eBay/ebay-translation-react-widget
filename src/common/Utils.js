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

const ebayAdServicesUrl =
    'https://www.ebayadservices.com/marketingtracking/v1/impression?mkevt=2&mkcid=1&mkrid=711-53200-19255-0&toolid=10050&ff20=030E34690L3R';

const triggerImpression = () => {
    fetch(ebayAdServicesUrl, { mode: 'no-cors' });
};

module.exports = { triggerImpression };
