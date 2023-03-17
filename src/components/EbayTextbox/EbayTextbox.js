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
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { InputAdornment, TextField } from '@material-ui/core';

import Logo from '../Logo/Logo';

const useStyles = makeStyles((theme) => ({
    textfield: { width: '25em' },
    [theme.breakpoints.down('md')]: {
        textfield: { width: '18em' }
    }
}));

export const EbayTextbox = (props) => {
    const classes = useStyles();

    return (
        <span>
            <TextField
                className={classes.textfield}
                data-testid="ebay-textbox"
                disabled={props.disabled}
                id="outlined-multiline-static"
                inputProps={{ maxLength: props.maxLength }}
                label={props.label}
                multiline={props.multiline}
                onChange={props.onChange}
                minRows={props.rows}
                value={props.value}
                variant="outlined"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end" variant="filled">
                            <Logo />
                        </InputAdornment>
                    )
                }}
            />
        </span>
    );
};

EbayTextbox.propTypes = {
    disabled: PropTypes.bool,
    label: PropTypes.string,
    maxLength: PropTypes.number,
    multiline: PropTypes.bool,
    onChange: PropTypes.func,
    rows: PropTypes.number,
    value: PropTypes.string
};
