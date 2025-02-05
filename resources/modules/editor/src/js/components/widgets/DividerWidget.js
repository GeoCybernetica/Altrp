import { renderAsset } from "../../../../../front-app/src/js/helpers";

(window.globalDefaults = window.globalDefaults || []).push(`
  .altrp-divider {
    padding-top: 15px;
    padding-bottom: 15px;
    line-height: 0;
    font-size: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .altrp-divider-container {
    display: flex;
    flex-direction: column;
  }

  .altrp-divider-separator {
    display: block;
    height: 1px;
    width: 100%;
  }

  .altrp-divider-label {
    text-align: center;
    line-height: normal;
    font-size: medium;
  }

  .altrp-divider-image {
    display: flex;
    justify-content: center;
  }

  .altrp-divider-image * {
    height: 100%;
    width: auto;
    display: flex;
    justify-content: center;
  }
`);

class DividerWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: props.element.getSettings()
    };
    props.element.component = this;
    if (window.elementDecorator) {
      window.elementDecorator(this);
    }
    if(props.baseRender){
      this.render = props.baseRender(this);
    }
  }

  getClasses() {
    return `altrp-divider ${this.isActive() ? 'active' : ''}`
  }

  render() {
    let style = {};
    let styleSeparator = {};

    let dividerAlignment = this.props.element.getResponsiveSetting("divider_alignment", null, "center");;
    switch (dividerAlignment) {
      case "flex-start":
        styleSeparator = {
          marginRight: "auto",
        }
        break;
      case "flex-end":
        styleSeparator = {
          marginLeft: "auto"
        }
        break;
      case "center":
        styleSeparator = {
          marginRight: "auto",
          marginLeft: "auto"
        }
        break;
    }
    const sccClasses = this.getClasses();
    let divider = <div className={sccClasses} style={style}>
      <span className="altrp-divider-separator" style={styleSeparator} />
    </div>

    const dividerImage = this.props.element.getResponsiveSetting("divider_image")
    const dividerText = this.props.element.getResponsiveSetting("divider_text")

    if (dividerText || dividerImage?.id) {
      const dividerLabel = <>
        {dividerImage?.id 
          ? <div className="altrp-divider-image">
              {renderAsset(dividerImage)}
            </div> 
          : ''
        }
        {dividerText 
          ? <div className='altrp-divider-label'>
              {dividerText}
            </div> 
          : ''
        }
      </>

      const labelPosition = this.state.settings.label_position || 'center'

      return <div className={sccClasses} style={style}>
        {labelPosition != 'left' && <span className="altrp-divider-separator divider-separator-left" />}
        <div className="altrp-divider-container-label">
          {dividerLabel}
        </div>
        {labelPosition != 'right' && <span className="altrp-divider-separator divider-separator-right" />}
      </div>
    }

    return divider

  }
}

export default DividerWidget
