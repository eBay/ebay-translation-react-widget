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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import { Alert, ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import {
    ErrorOutlineTwoTone,
    LocalOfferTwoTone,
    ArrowDownwardTwoTone,
    ArrowForwardTwoTone,
    TextFieldsTwoTone
} from '@material-ui/icons';
import {
    defaultErrorMessage,
    headers,
    primaryColor,
    translationContextEnum
} from './src/common/Constants';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { languageIdMap, supportedTranslations } from './src/common/SupportedTranslations';
import { Box, Button, Collapse, Grid, MenuItem, Select } from '@material-ui/core';

import { EbayTextbox } from './src/components/EbayTextbox/EbayTextbox';

import '@ebay/skin/marketsans';
import '@ebay/skin/page-notice';
import '@ebay/skin/progress-spinner';

const utils = require('./src/common/Utils');
const theme = createTheme({
    typography: {
        fontFamily: 'Market Sans'
    }
});

const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: 'Market Sans',

        '& .MuiTextField-root': {
            margin: theme.spacing(1)
        },
        '& .MuiFormLabel-root.Mui-disabled': {
            color: primaryColor
        },
        '& .MuiFormLabel-root.Mui-focused': {
            borderColor: primaryColor,
            color: primaryColor
        }
    },
    buttonProgress: {
        top: '50%',
        left: '50%',
        position: 'absolute',
        marginTop: -15,
        marginLeft: -15
    },
    languageSelect: {
        display: 'block',
        margin: 9,
        width: '10em'
    },
    wrapper: {
        margin: theme.spacing(1),
        position: 'relative'
    },
    translateButton: {
        backgroundColor: primaryColor,
        textTransform: 'none',
        fontSize: 16,
        minWidth: 128,
        minHeight: 40,
        padding: '11px 16px',
        '&:hover': {
            backgroundColor: '#2b0eaf',
            color: '#FFF'
        }
    }
}));

const EbayTranslationWidget = (props) => {
    const classes = useStyles();

    useEffect(() => {
        utils.triggerImpression();
    }, []);

    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [originalText, setOriginalText] = useState();
    const [fromLanguage, setFromLanguage] = useState('en');
    const [translationContext, setTranslationContext] = useState(translationContextEnum[0].id);
    const [translatedText, setTranslatedText] = useState('');
    const [translationInput, setTranslationInput] = React.useState('text');
    const [originalTitle, setOriginalTitle] = useState('');
    const [translatedTitle, setTranslatedTitle] = useState('');
    const [originalDescription, setOriginalDescription] = useState('');
    const [translatedDescription, setTranslatedDescription] = useState('');
    const [supportedTranslationsArr, setSupportedTranslationsArr] = useState(
        supportedTranslations[0].supportedTranslations
    );
    const [toLanguage, setToLanguage] = useState(supportedTranslationsArr[0]);

    const handleAlignment = (event, newAlignment) => {
        // Cleanup
        setOriginalText('');
        setTranslatedText('');

        newAlignment && setTranslationInput(newAlignment);
    };

    const handleWarnings = (response) => {
        const warningsArr = [];
        if (response.warnings && response.warnings.length > 0) {
            props.warningMessage
                ? warningsArr.push(props.warningMessage)
                : response.warnings.map((warning) => warningsArr.push(warning.message));
        }
        setWarnings(warningsArr);
    };

    const handleError = (response) => {
        const errorsArr = [];
        if (props.errorMessage) {
            errorsArr.push(props.errorMessage);
        } else {
            if (response.errors && response.errors.length > 0) {
                response.errors.map((error) => {
                    errorsArr.push(`${error.message}`);
                });
            } else {
                errorsArr.push(defaultErrorMessage);
            }
        }
        setErrors(errorsArr);
    };

    const clearErrorsAndWarnings = () => {
        setErrors([]);
        setWarnings([]);
    };

    const isNumber = (val) => {
        return !isNaN(val);
    };

    const isItemId = (id) => {
        const re = new RegExp('\\|', 'g');
        const result = id.match(re);
        return result && result.length === 2 && id.startsWith('v1|');
    };

    const handleApiCall = () => {
        clearErrorsAndWarnings();
        originalText && setOriginalText(originalText.trim());
        if (originalText && originalText.length > 0) {
            const requestBody = {
                from: fromLanguage,
                to: toLanguage,
                translationContext: translationContext
            };

            if (isNumber(originalText)) {
                requestBody.listingId = originalText;
            } else if (isItemId(originalText)) {
                requestBody.itemId = originalText;
            } else {
                requestBody.text = originalText;
            }

            setLoading(true);

            fetch(props.backendEndpoint, {
                method: 'POST',
                headers: headers.applicationJson,
                body: JSON.stringify(requestBody)
            })
                .then((res) => res.json())
                .then(
                    (result) => {
                        if (result && result.translations) {
                            handleWarnings(result);
                            setOriginalText(result.translations[0].originalText);
                            setTranslatedText(result.translations[0].translatedText);
                        } else if (result && result.title && result.description) {
                            if (result.title.translations) {
                                setOriginalTitle(result.title.translations[0].originalText);
                                setTranslatedTitle(result.title.translations[0].translatedText);
                            } else {
                                handleError(result.title);
                            }
                            if (result.description.translations) {
                                setOriginalDescription(
                                    result.description.translations[0].originalText
                                );
                                setTranslatedDescription(
                                    result.description.translations[0].translatedText
                                );
                            } else {
                                handleError(result.description);
                            }
                        } else {
                            handleError(result);
                            setTranslatedText('');
                        }
                        setLoading(false);
                    },
                    (error) => {
                        handleError(error);
                        setLoading(false);
                    }
                );
        } else {
            setErrors(['Please provide a valid input']);
        }
    };

    const handleFromLanguageChange = (event) => {
        setFromLanguage(event.target.value);
        let langaugeJson = supportedTranslations.filter(
            (item) => item['name'] === event.target.value
        )[0].supportedTranslations;
        setSupportedTranslationsArr(langaugeJson);
        setToLanguage(langaugeJson[0]);
    };

    const handleToLanguageChange = (event) => {
        setToLanguage(event.target.value);
    };

    const handleTranslationContextChange = (event) => {
        setTranslationContext(event.target.value);
    };

    const matches = useMediaQuery('(min-width:600px)');

    return (
        <ThemeProvider theme={theme}>
            <form className={classes.root} noValidate autoComplete="off">
                <Grid
                    container
                    alignItems="center"
                    direction="row"
                    justifyContent="center"
                    spacing={5}
                    style={{ marginBottom: 50 }}>
                    {!props.hideErrors && (
                        <Box display="flex" m={1} p={1} flexWrap="wrap">
                            <Collapse in={errors.length > 0} mountOnEnter unmountOnExit>
                                {errors.map((error, index) => (
                                    <section
                                        key={index}
                                        className="page-notice page-notice--attention"
                                        aria-label="Attention">
                                        <div className="page-notice__header">
                                            <ErrorOutlineTwoTone style={{ color: '#e62048' }} />
                                        </div>
                                        <div className="page-notice__main">
                                            <p>{error}</p>
                                        </div>
                                    </section>
                                ))}
                            </Collapse>
                        </Box>
                    )}

                    {!props.hideWarnings && (
                        <Box display="flex" m={1} p={1} flexWrap="wrap">
                            <Collapse in={warnings.length > 0} mountOnEnter unmountOnExit>
                                {warnings.map((warning, index) => (
                                    <Alert key={index} severity="warning" className={classes.alert}>
                                        {warning}
                                    </Alert>
                                ))}
                            </Collapse>
                        </Box>
                    )}
                </Grid>

                <Grid
                    container
                    alignItems="center"
                    direction="row"
                    justifyContent="center"
                    spacing={5}
                    style={{ justifyContent: 'center', marginBottom: 10 }}>
                    <ToggleButtonGroup
                        value={translationInput}
                        exclusive
                        onChange={handleAlignment}
                        aria-label="Translation input">
                        <ToggleButton value="text" aria-label="Translate by text">
                            <TextFieldsTwoTone />
                        </ToggleButton>
                        <ToggleButton value="id" aria-label="Translate by ID">
                            <LocalOfferTwoTone />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                <Grid
                    container
                    alignItems="center"
                    direction="row"
                    justifyContent="center"
                    spacing={5}
                    style={{ justifyContent: 'center' }}>
                    <Grid item>
                        <Select
                            className={classes.languageSelect}
                            labelId="from-language-select-label"
                            id="from-language-select"
                            onChange={handleFromLanguageChange}
                            value={fromLanguage}
                            label="From Language">
                            {supportedTranslations.map((language) => (
                                <MenuItem key={language.name} value={language.name}>
                                    {languageIdMap[language.name]}
                                </MenuItem>
                            ))}
                        </Select>
                        {translationInput === 'text' && (
                            <EbayTextbox
                                label="Enter title or description"
                                maxLength={100000}
                                multiline={true}
                                rows={10}
                                onChange={(event) => setOriginalText(event.target.value)}
                            />
                        )}
                    </Grid>
                    {translationInput === 'text' && (
                        <Grid item>
                            {matches ? <ArrowForwardTwoTone /> : <ArrowDownwardTwoTone />}
                        </Grid>
                    )}
                    {translationInput === 'id' && <ArrowForwardTwoTone />}
                    <Grid item>
                        <Select
                            className={classes.languageSelect}
                            labelId="to-language-select-label"
                            id="to-language-select"
                            onChange={handleToLanguageChange}
                            value={toLanguage}
                            label="To Language">
                            {supportedTranslationsArr.map((language) => (
                                <MenuItem key={language} value={language}>
                                    {languageIdMap[language]}
                                </MenuItem>
                            ))}
                        </Select>

                        {translationInput === 'text' && (
                            <EbayTextbox disabled multiline rows={10} value={translatedText} />
                        )}
                    </Grid>
                </Grid>

                <Grid
                    container
                    alignItems="center"
                    direction="row"
                    justifyContent="center"
                    spacing={5}
                    style={{ justifyContent: 'center' }}>
                    {translationInput === 'text' && (
                        <Grid item>
                            <Select
                                labelId="translation-context-select-label"
                                id="translation-context-select"
                                onChange={handleTranslationContextChange}
                                value={translationContext}
                                label="Translation Context">
                                {translationContextEnum.map((marketplace) => (
                                    <MenuItem key={marketplace.id} value={marketplace.id}>
                                        {marketplace.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    )}
                    {translationInput === 'id' && (
                        <EbayTextbox
                            label="Enter item/listing ID"
                            maxLength={100}
                            onChange={(event) => setOriginalText(event.target.value)}
                        />
                    )}
                    <Grid item>
                        <div className={classes.wrapper}>
                            <Button
                                color="primary"
                                data-testid="translate-button"
                                disabled={isLoading}
                                onClick={handleApiCall}
                                classes={{
                                    root: classes.translateButton,
                                    focused: classes.translateButtonSelected
                                }}
                                variant="contained">
                                Translate
                            </Button>
                            {isLoading && (
                                <span
                                    className={`progress-spinner ${classes.buttonProgress}`}
                                    aria-label="Busy"
                                    role="img"></span>
                            )}
                        </div>
                    </Grid>
                </Grid>

                {translationInput === 'id' &&
                    ((translatedTitle && translatedTitle.length > 0) ||
                        (translatedDescription && translatedDescription.length > 0)) && (
                        <span>
                            <Grid
                                container
                                alignItems="center"
                                direction="row"
                                justifyContent="center"
                                spacing={5}
                                style={{
                                    marginBottom: 50,
                                    marginTop: 50,
                                    justifyContent: 'center'
                                }}>
                                <EbayTextbox
                                    disabled
                                    label="Original title"
                                    multiline
                                    rows={2}
                                    value={originalTitle}
                                />
                                <EbayTextbox
                                    disabled
                                    label="Translated title"
                                    multiline
                                    rows={2}
                                    value={translatedTitle}
                                />
                            </Grid>

                            <Grid
                                container
                                alignItems="center"
                                direction="row"
                                justifyContent="center"
                                spacing={5}
                                style={{ justifyContent: 'center' }}>
                                <EbayTextbox
                                    disabled
                                    label="Original description"
                                    multiline
                                    rows={10}
                                    value={originalDescription}
                                />

                                <EbayTextbox
                                    disabled
                                    label="Translated description"
                                    multiline
                                    rows={10}
                                    value={translatedDescription}
                                />
                            </Grid>
                        </span>
                    )}
            </form>
        </ThemeProvider>
    );
};

EbayTranslationWidget.propTypes = {
    backendEndpoint: PropTypes.string,
    errorMessage: PropTypes.string,
    hideErrors: PropTypes.bool,
    hideWarnings: PropTypes.bool,
    warningMessage: PropTypes.string
};

export default EbayTranslationWidget;
