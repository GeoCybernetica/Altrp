import {
  getDataByPath,
  isEditor, parseURLTemplate
} from "../../../../../front-app/src/js/helpers";
import AltrpImage from "../altrp-image/AltrpImage";

(window.globalDefaults = window.globalDefaults || []).push(`
  .altrp-image {
    margin-top: 0;
    margin-right: 0;
    margin-bottom: 0;
    margin-left: 0;
    padding-top: 0;
    padding-right: 0;
    padding-bottom: 0;
    padding-left: 0;
    opacity: 1;
    object-fit: cover;
    border-color: rgb(50,168,82);
    border-radius: 0;
  }

  .altrp-image-container {
    display: flex;
    justify-content: center;
  }
`)

const Link = window.Link
class ImageWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: props.element.getSettings(),
    };
    props.element.component = this;
    if (window.elementDecorator) {
      window.elementDecorator(this);
    }
    if(props.baseRender){
      this.render = props.baseRender(this);
    }
  }

  render() {
    const { element } = this.props;
    const link = this.state.settings.image_link || {};
    const cursorPointer = this.props.element.getSettings("cursor_pointer", false);
    // const background_image = this.props.element.getSettings(
    //   "background_image",
    //   {}
    // );
    let classNames = "altrp-image-container";
    let media = this.state.settings.content_media;

    if(cursorPointer) {
      classNames += " cursor-pointer"
    }

    /**
     * Для карточки модель может быть другой
     * @type {AltrpModel}
     */
    let model = element.hasCardModel()
      ? element.getCardModel()
      : this.props.currentModel;
    /**
     * Возьмем данные из окружения
     */
    if(this.getContent('raw_url')){
      media = {
        url: this.getContent('raw_url'),
        assetType: "media",
      }
    } else if (
      this.getContent("content_path") &&
      _.isObject(getDataByPath(this.getContent("content_path"), null, model))
    ) {
      media = getDataByPath(this.getContent("content_path"), null, model);
      /**
       * Проверим массив ли с файлами content_path
       */
      if (_.get(media, "0") instanceof File) {
        media = _.get(media, "0");
      } else {
        media.assetType = "media";
      }
    } else if (
      this.getContent("content_path") &&
      _.isString(getDataByPath(this.getContent("content_path"), null, model))
    ) {
      media = getDataByPath(this.getContent("content_path"), null, model);
      media = {
        assetType: "media",
        url: media,
        name: "null"
      };
    } else if (this.getContent('default_url') && _.isString(getDataByPath(this.getContent("default_url"), null, model))){
      media = {
        assetType: "media",
        url: getDataByPath(this.getContent("default_url"), null, model),
        name: "default"
      };
    }
    let width = this.props.element.getResponsiveSetting('width_size');
    let height = this.props.element.getResponsiveSetting('height_size');
    width = _.get(width, 'size', '100') + _.get(width, 'unit', '%');
    if(_.get(height, 'size')){
      height = _.get(height, 'size') + _.get(height, 'unit', '%');
    } else {
      height = '';
    }

    if(_.get(this.props.element.getResponsiveSetting('height_size'), 'size', '100') === "0") {
      height = ""
    }

    let altrpImage = (
      <AltrpImage
        image={media}
        width={width}
        element={this.props.element}
        height={height}
        // className={
        //   "altrp-image" +
        //   (background_image ? " altrp-background-image-widget" : "")
        // }
        className="altrp-image"
      />
    );

    if (link.toPrevPage && !isEditor()) {
      return (
        <div
          className={classNames}
          onClick={() => {
            history.back();//todo: реализовать для h-altrp
          }}
        >
          {altrpImage}
        </div>
      );
    } else {
      let linkUrl = link.url || '';
      linkUrl = parseURLTemplate(linkUrl, this.props.element.getCurrentModel().getData());
      const linkProps = {

      };
      if(link.openInNew){
        linkProps.target = '_blank';
      }

      return (
        <div
          className={classNames}
        >
          {(linkUrl && ! isEditor()) ? (
            link.tag === "a" || window['h-altrp'] ? (
              <a href={linkUrl} {...linkProps}>{altrpImage}</a>
            ) : (
              <Link to={linkUrl} {...linkProps}>{altrpImage}</Link>
            )
          ) : (
            altrpImage
          )}
        </div>
      );
    }
  }
}

// const path = window.location.pathname;
// let _export;
// if (path.includes("reports")) {
//   _export = ImageWidget;
// } else {
//   _export = withRouter(ImageWidget);
// }
export default ImageWidget;
