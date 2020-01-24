import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Select from 'react-select';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';

import styles from './SelectOneStyles';

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

NoOptionsMessage.propTypes = {
  inputRef: PropTypes.any,
  selectProps: PropTypes.any,
  innerProps: PropTypes.any,
  children: PropTypes.any,
};

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

inputComponent.propTypes = {
  inputRef: PropTypes.any,
};

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

Control.propTypes = {
  selectProps: PropTypes.any,
  innerProps: PropTypes.any,
  children: PropTypes.any,
  innerRef: PropTypes.any,
};

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

Option.propTypes = {
  selectProps: PropTypes.any,
  innerProps: PropTypes.any,
  children: PropTypes.any,
  innerRef: PropTypes.any,
  isFocused: PropTypes.any,
  isSelected: PropTypes.any,
};

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

Placeholder.propTypes = {
  selectProps: PropTypes.any,
  innerProps: PropTypes.any,
  children: PropTypes.any,
};

function ValueContainer(props) {
  return (
    <div
      className={`${
        props.selectProps.classes.valueContainer
      } force-color-valueContainer`}
    >
      {props.children}
    </div>
  );
}

ValueContainer.propTypes = {
  selectProps: PropTypes.object.isRequired,
  children: PropTypes.any,
};

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}

MultiValue.propTypes = {
  selectProps: PropTypes.any,
  innerProps: PropTypes.any,
  children: PropTypes.any,
  removeProps: PropTypes.any,
  isFocused: PropTypes.any,
};

function Menu(props) {
  return (
    <Paper
      square
      className={props.selectProps.classes.paper}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  );
}

Menu.propTypes = {
  selectProps: PropTypes.any,
  innerProps: PropTypes.any,
  children: PropTypes.any,
};

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  ValueContainer,
};

class IntegrationReactSelect extends React.Component {
  state = {
    multi: null,
  };

  handleChange = name => value => {
    this.setState({
      [name]: value,
    });
    this.props.onChange(value);
  };

  render() {
    const { classes, theme, label, placeholder, suggestions } = this.props;

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };

    return (
      <div className={classes.root}>
        <NoSsr>
          <Select
            classes={classes}
            styles={selectStyles}
            textFieldProps={{
              label,
              InputLabelProps: {
                shrink: true,
              },
            }}
            options={suggestions}
            components={components}
            value={this.state.multi}
            onChange={this.handleChange('multi')}
            placeholder={placeholder}
          />
        </NoSsr>
      </div>
    );
  }
}

IntegrationReactSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  suggestions: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(IntegrationReactSelect);
