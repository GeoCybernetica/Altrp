import BaseElement from "./BaseElement";
import DividerIcon from "../../../svgs/divider.svg";
import {
  CONTROLLER_TEXTAREA,
  CONTROLLER_COLOR,
  CONTROLLER_SELECT,
  CONTROLLER_TEXT,
  CONTROLLER_TYPOGRAPHIC,
  CONTROLLER_SHADOW,
  TAB_CONTENT,
  TAB_STYLE,
  CONTROLLER_NUMBER,
  CONTROLLER_DIMENSIONS,
  CONTROLLER_SLIDER,
  CONTROLLER_LINK,
  CONTROLLER_TRANSFORM,
  CONTROLLER_CHOOSE,
  CONTROLLER_MEDIA,
} from "../modules/ControllersManager";
import { advancedTabControllers } from "../../decorators/register-controllers";

class Divider extends BaseElement {
  static getName() {
    return "divider";
  }
  static getTitle() {
    return "Divider";
  }
  static getIconComponent() {
    return DividerIcon;
  }
  static getType() {
    return "widget";
  }
  static getGroup() {
    return "Basic";
  }
  _registerControls() {
    if (this.controllersRegistered) {
      return;
    }

    this.startControlSection("divider", {
      tab: TAB_CONTENT,
      label: "Divider",
    });

    this.addControl('divider_style_type', {
      type: CONTROLLER_SELECT,
      label: 'Style',
      default: 'solid',
      options: [
        {
          value: 'solid',
          label: 'Solid'
        },
        {
          value: 'none',
          label: 'None'

        },
        {
          value: 'double',
          label: 'Double'
        },
        {
          value: 'dotted',
          label: 'Dotted'
        },
        {
          value: 'dashed',
          label: 'Dashed'
        },
      ]
    });

    this.addControl("divider_width", {
      type: CONTROLLER_SLIDER,
      label: "Width",
      default: {
        unit: "%"
      },
      max: 1000,
      min: 0,
      units: [
        'px',
        '%',
        'vw',
      ],
    });

    this.addControl('divider_alignment', {
      type: CONTROLLER_CHOOSE,
      label: 'Alignment',
      default: 'left',
      options: [
        {
          icon: 'left',
          value: 'flex-start',
        },
        {
          icon: 'center',
          value: 'center',
        },
        {
          icon: 'right',
          value: 'flex-end',
        }
      ],
      locked: true,
    });
    
    this.addControl('divider_text', {
      type: CONTROLLER_TEXT,
      label: 'Text',
      locked: true,
    });

    this.addControl('divider_image', {
      type: CONTROLLER_MEDIA,
      label: 'Image',
      locked: true,
    });
    
    this.addControl('label_position', {
      type: CONTROLLER_CHOOSE,
      label: 'Label Position',
      default: 'center',
      options: [
        {
          icon: 'left',
          value: 'left',
        },
        {
          icon: 'center',
          value: 'center',
        },
        {
          icon: 'right',
          value: 'right',
        }
      ],
      locked: true,
    });

    this.endControlSection();
    
    this.startControlSection("divider_style", {
      tab: TAB_STYLE,
      label: "Divider",
    });

    this.addControl("divider_style_color", {
      type: CONTROLLER_COLOR,
      label: "Color",
      default: {
        color: "",
        colorPickedHex: "",
      },
    });

    this.addControl("divider_style_weight", {
      type: CONTROLLER_SLIDER,
      label: "Weight",
      default: {
        size: 3
      },
      max: 15,
      min: 1,
      step: 0.1,
    });

    this.addControl('label_spacing', {
      type: CONTROLLER_SLIDER,
      label: 'Label Spacing',
      default: {
        size: 0,
        unit: "px"
      },
      max: 200,
      min: 0,
      units: [
        'px',
        '%',
        'vh',
        "vw"
      ],
    });

    this.addControl("divider_style_gap", {
      type: CONTROLLER_SLIDER,
      label: "Gap",
      max: 50,
      min: 2,
    });

    this.endControlSection();

    this.startControlSection("text_style", {
      tab: TAB_STYLE,
      label: "Text",
    });

    this.addControl("text_style_color", {
      type: CONTROLLER_COLOR,
      label: "Color",
      default: {
        color: "",
        colorPickedHex: "",
      },
    });

    this.addControl('text_style_typographic', {
      type: CONTROLLER_TYPOGRAPHIC,
      label: 'Typographic',
    });

    this.endControlSection();

    this.startControlSection('image_styles', {
      tab: TAB_STYLE,
      label: 'Image',
    })

    this.addControl('image_size', {
      type: CONTROLLER_SLIDER,
      label: 'Size',
      min: 10,
      max: 300,
      step: 1
    })

    this.addControl("image_fill", {
      type: CONTROLLER_COLOR,
      label: "Fill",
    });
    
    this.endControlSection();

    this.startControlSection('position_section', {
      tab: TAB_STYLE,
      label: 'Position',
    });

    this.addControl('position_z_index', {
      type: CONTROLLER_NUMBER,
      label: 'Z-Index',
    });

    this.endControlSection();

    advancedTabControllers(this);
  }
}

export default Divider;
