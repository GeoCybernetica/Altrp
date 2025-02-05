import React from "react";
// import { createMask, Masked } from "imask";
// import {isNumber} from "../../../../../altrp-reports/src/helpers/number";

class MaskedInput extends React.Component {
  constructor(props) {
    super(props);

    const {content_default_value : defaultValue} = props.inputProps.settings

    this.state = {
      previewValue: defaultValue ? defaultValue : '',
      value: defaultValue,
      defaultValue,
      max: 0,
      type: [],
      mask: _.clone(props.inputProps.settings.content_mask)
    }

    this.inputRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.updateMask = this.updateMask.bind(this);
    this.handleBackspace = this.handleBackspace.bind(this);
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if(prevProps.inputProps.type !== this.props.inputProps.type) {
  //     this.maskedValue.updateValue()
  //   }
  // }

  componentDidMount() {

    this.setState((s) => ({
      ...s,
      mask: this.props.mask
    }))

    this.updateMask()
  }

  updateMask() {
    const mask = this.state.mask;
    const value = this.state.value;

    // let mask = "+{7}(000)000-00-00"

    // const findDefaultText = RegExp("[^{}]*", "gm");
    //
    // mask = findDefaultText.exec(mask);
    let previewValue = "";
    let continueSplit = false;
    const split = mask.split("");
    let valueIndex = 0;
    let maxLength = 0;
    let type = "";
    let numbersLength = (mask.match(/0/g) || []).length;
    let stringLength = (mask.match(/_/g) || []).length;
    maxLength += numbersLength + stringLength;

    if(stringLength > 0) {
      type = "string"
    } else if(numbersLength > 0) {
      type = "number"
    }

    if(value) {
      for(const char of split) {
        const currentValueChar = value[valueIndex]

        if(!currentValueChar && char !== "") {
          break;
        }

        if(char === "}") {
          continueSplit = false
        }

        if(continueSplit) {
          previewValue += char;
          continue;
        }

        switch (char) {
          case "0":
            if(currentValueChar && !isNaN(currentValueChar)) {
              previewValue += currentValueChar
              valueIndex = valueIndex + 1;
            }
            break
          case "_":
            if(currentValueChar) {
              previewValue += currentValueChar
              valueIndex = valueIndex + 1;
            }
            break
          default:
            previewValue += char
        }
      }
    }

    this.setState((s) => ({
      ...s,
      previewValue,
      max: maxLength,
      type
    }))

    return previewValue


    // \[([^\][]*)] find []
  }

  handleChange(e) {
    if(this.state.value?.length < this.state.max) {
      let value = e.target.value;
      const newChar = value.slice(-1);

      switch (this.state.type) {
        case "number":
          if(!isNaN(newChar) && newChar !== ' ') {
            this.setState((s) => ({
              ...s,
              value: s.value + newChar
            }), () => {
              this.updateMask()
              this.props.inputProps.onChange({ target: {value: this.state.value}})
            })
          }
          break
        default:
          this.setState((s) => ({
            ...s,
            value: s.value + newChar
          }), () => {
            this.updateMask()
            this.props.inputProps.onChange({ target: {value: this.state.value}})
          })

      }
    }
  }

  handleBackspace(e) {
    if(e.key === "Backspace") {
      this.setState((s) => ({
        ...s,
        value: s.value.slice(0, -1)
      }), () => {
        this.updateMask()
      })

      e.preventDefault()
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const maskSetting = this.props.inputProps.settings.content_mask;

    const {content_default_value : defaultValue} = this.props.inputProps.settings

    if (defaultValue !== this.state.defaultValue) {
      this.setState(s => ({
        ...s,
        previewValue: defaultValue ? defaultValue : '',
        value: defaultValue,
        defaultValue,
      }))
    }
    
    if(this.state.mask !== maskSetting) {
      this.setState((s) => ({
        ...s,
        mask: maskSetting,
        previewValue: "",
        value: "",
        type: [],
        max: 0,
      }))
    }
  }

  render() {
    return React.createElement(this.props.input, {
      ...this.props.inputProps,
      inputRef: this.inputRef,
      onChange: this.handleChange,
      onKeyDown: this.handleBackspace,
      value: this.state.previewValue
    })
  }
}

export default MaskedInput
