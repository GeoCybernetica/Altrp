import {changeFormFieldValue} from "../../../../../front-app/src/js/store/forms-data-storage/actions";
import numberWithSpaces from "../../helpers/number-with-spaces";
const {isEditor} = window.altrpHelpers;

const Slider = window.altrpLibs.Blueprint.RangeSlider;

(window.globalDefaults = window.globalDefaults || []).push(`
.bp3-slider-label{
    white-space: nowrap;
}
.bp3-slider-handle{
    z-index: 2;
}
.bp3-slider-label{
    z-index: 1;
}
`);

const SliderWrapper = styled.div`
  .altrp-field-slider .bp3-slider-handle {
    background-image: none;
  }

  ${(props) => {
    let styles = "";

    if(props.handleSize) {
      if(props.handleSize.size) {
        styles += `
        &.altrp-field-slider-horizontal .bp3-slider-handle.bp3-start {
          left: calc(${(props.value[0]/props.max*100).toFixed(2)}% - 8px) !important;
        }

        &.altrp-field-slider-horizontal .bp3-slider-handle.bp3-end {
          left: calc(${(props.value[1]/props.max*100).toFixed(2)}% - 8px) !important;
        }

        &.altrp-field-slider-vertical .bp3-slider-handle.bp3-start {
          bottom: calc(${(props.value[0]/props.max*100).toFixed(2)}% - ${props.handleSize.size - 4}px) !important;
        }

        &.altrp-field-slider-vertical .bp3-slider-handle.bp3-end {
          bottom: calc(${(props.value[1 ]/props.max*100).toFixed(2)}% - ${props.handleSize.size - 4}px) !important;
        }
        `
      }
    }

    return styles
  }}
`;

class InputRangeSliderWidget extends Component {
  constructor(props) {
    super(props);

    let step = props.element.getResponsiveSetting("step", "", null);
    const min = props.element.getResponsiveSetting("min", "", 0);
    const max = props.element.getResponsiveSetting("max", "", 100);

    if(step) {
      step = (max - min) / step;
    }

    this.state = {
      settings: props.element.getSettings(),
      value: [
        min,
        max
      ],
      step: step || 1,
    };

    props.element.component = this;

    if (window.elementDecorator) {
      window.elementDecorator(this);
    }
    if(props.baseRender){
      this.render = props.baseRender(this);
    }
    this.onChange = this.onChange.bind(this);
    this.label = this.label.bind(this);
  }

  _componentDidUpdate(prevProps, prevState) {
    const prevStep = prevState.step
    let step = this.props.element.getResponsiveSetting("step", "", null);
    const min = this.props.element.getResponsiveSetting("min", "", 0);
    const max = this.props.element.getResponsiveSetting("max", "", 100);

    if(step && step < max) {
      step = (max - min) / step;
    }

    if(step !== prevStep) {
      this.setState((s) => ({...s,
        step,
        value: [
          this.props.element.getResponsiveSetting("initial", "", 0),
          this.props.element.getResponsiveSetting("initial_second", "", 0)
        ]
      }))
    }
  }

  /**
   * Передадим значение в хранилище формы
   * @param {*} value
   * @param index
   * @param {boolean} userInput true - имзенилось пользователем
   */
  dispatchFieldValueToStore = async (value, index, userInput = false) => {

    let formId;
    let fieldName;

    if(index === 0) {
      formId = this.props.element.getFormId("form_id_start");
      fieldName = this.props.element.getFieldId("field_id_start");
    } else if(index === 1) {
      formId = this.props.element.getFormId("form_id_end");
      fieldName = this.props.element.getFieldId("field_id_end");
    }
    if (fieldName.indexOf("{{") !== -1) {
      fieldName = replaceContentWithData(fieldName);
    }
    if (_.isObject(this.props.appStore) && fieldName && formId) {
      this.props.appStore.dispatch(
        changeFormFieldValue(fieldName, value, formId, userInput)
      );
      if (userInput) {
        const change_actions = this.props.element.getSettings("change_actions");

        if (change_actions && !isEditor()) {
          const actionsManager = (
            await import(
              /* webpackChunkName: 'ActionsManager' */
              "../../../../../front-app/src/js/classes/modules/ActionsManager.js"
              )
          ).default;
          await actionsManager.callAllWidgetActions(
            this.props.element.getIdForAction(),
            "change",
            change_actions,
            this.props.element
          );
        }
      }
    }
  };

  /**
   *
   * @returns {number}
   */
  getValue = () => {
    let value;
    let formIdStart = this.props.element.getFormId("form_id_start");
    let fieldNameStart = this.props.element.getFieldId("field_id_start");
    let formIdEnd = this.props.element.getFormId("form_id_end");
    let fieldNameEnd = this.props.element.getFieldId("field_id_end");

    if (isEditor()) {
      value = this.state.value;
    } else {
      let valueStart

      valueStart = _.get(appStore.getState().formsStore, `${formIdStart}`, '')
      valueStart = _.get(valueStart, fieldNameStart, '')
      let valueEnd

      valueEnd = _.get(appStore.getState().formsStore, `${formIdEnd}`, '')
      valueEnd = _.get(valueEnd, fieldNameEnd, '')

      value = [
        valueStart,
        valueEnd
      ];
    }

    if(!value[0] && !value[1]) {
      return [
        this.props.element.getResponsiveSetting('min', "", 0),
        this.props.element.getResponsiveSetting('max', "", 100),
      ]
    }

    if(!value[0]) {
      value[0] = this.props.element.getResponsiveSetting('min', "", 0);
    }

    if(!value[1]) {
      value[1] = this.props.element.getResponsiveSetting('max', "", 100);
    }
    value = value.map((value)=>(Number(value) || 0))
    return value
  }

  onChange(values) {
    let decimalPlace = this.props.element.getResponsiveSetting("decimal_place", "", null);
    decimalPlace = Math.abs(decimalPlace);

    values.forEach((value, idx) => {
      if(!Number.isInteger(value)) {
        values[idx] = value
          .toFixed(decimalPlace)
      }
    });

    if(isEditor()){
      this.setState((s) => ({...s, value: values}))
    } else {
      this.dispatchFieldValueToStore(values[0], 0, true)
      this.dispatchFieldValueToStore(values[1], 1, true)
    }
  }

  label(value) {
    let decimalPlace = this.props.element.getResponsiveSetting("decimal_place", "", null);
    const custom = this.props.element.getResponsiveSetting("custom_label", "", "{n}");
    const thousandsSeparator = this.props.element.getResponsiveSetting("thousands_separator", "", false);
    let thousandsSeparatorValue = this.props.element.getResponsiveSetting("thousands_separator_value", "", " ");
    const decimalSeparator = this.props.element.getResponsiveSetting("decimal_separator");
    value = Number(value)

    if(!Number.isInteger(value) && decimalPlace) {
      decimalPlace = Math.abs(decimalPlace);
      value = value
        .toFixed(decimalPlace)
    }

    if(!Number.isInteger(value) && decimalSeparator) {
      value = value.toString().replace(".", decimalSeparator)
    }

    if(thousandsSeparator) {
      if( ! thousandsSeparatorValue){
        thousandsSeparatorValue = ' '
      }
      value = numberWithSpaces(value, thousandsSeparatorValue);
    }


    return custom
      .toString()
      .replace(/{n}/, value)
  }

  render() {
    const min = this.props.element.getResponsiveSetting("min", "", 0);
    const max = this.props.element.getResponsiveSetting("max", "", 100);
    // const step = this.props.element.getResponsiveSetting("step", "", 1);
    const labelStepSize = this.props.element.getResponsiveSetting("label_step", "", 25);
    const decimalPlace = this.props.element.getResponsiveSetting("decimal_place", "", null);
    const vertical = this.props.element.getResponsiveSetting("vertical", "", false);
    const handleSize = this.props.element.getResponsiveSetting("handle_size", "", null);
    let step = this.props.element.getResponsiveSetting("step", "", 1);

    let value = this.getValue();

    if(Number.isNaN(value[0])){
      value[0] = Number(min)
    }

    if(Number.isNaN(value[1])) {
      value[1] = Number(max);
    }

    return (
      <SliderWrapper
        value={this.state.value}
        max={max}
        handleSize={handleSize}
        className={"altrp-field-slider-wrapper" + (vertical ? " altrp-field-slider-vertical" : " altrp-field-slider-horizontal")}
      >
        <Slider
          min={min}
          max={max}
          stepSize={step}
          value={value}
          onChange={this.onChange}
          labelPrecision={decimalPlace}
          labelRenderer={this.label}
          labelStepSize={labelStepSize}
          vertical={vertical}
          className="altrp-field-slider"
        />
      </SliderWrapper>
    );
  }
}

export default InputRangeSliderWidget;
