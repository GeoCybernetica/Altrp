import {
  addImage,
  addImageToLightboxStorage, removeImageFromLightbox
} from "../../../../../front-app/src/js/store/ligtbox-images-storage/actions";

const {
  getDataByPath,
  isEditor, parseURLTemplate
} = window.altrpHelpers;
import AltrpImage from "../altrp-image/AltrpImage";
import AltrpLightbox from "../altrp-lightbox/AltrpLightbox";

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
`)

class ImageLightboxWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: props.element.getResponsiveSetting(),
      lightbox: false
    };
    props.element.component = this;
    if (window.elementDecorator) {
      window.elementDecorator(this);
    }
    if (props.baseRender) {
      this.render = props.baseRender(this);
    }

    this.lightboxID = props.element.getResponsiveSetting('l_id');
  }

  _componentDidMount() {
    this.updateLightboxStore()
  }

  _componentDidUpdate(){
    this.updateLightboxStore()
  }

  /**
   * Add image data to lightbox store if necessary
   */
  updateLightboxStore() {
    if(isEditor()){
      return;
    }
    const lightBoxID = this.props.element.getResponsiveSetting('l_id')
    if(! lightBoxID){
      return
    }
    const media = this.getMedia()
    if(! media?.url || this.addedURL === media.url){
      return;
    }
    this.props.appStore.dispatch(addImageToLightboxStorage(media.url, lightBoxID, ))
    this.addedURL = media.url
  }

  _componentWillUnmount() {
    const lightBoxID = this.props.element.getResponsiveSetting('l_id')
    if(! lightBoxID){
      return
    }
    this.props.appStore(removeImageFromLightbox(media.url, lightBoxID, ))
  }
  /**
   *
   * @returns {{}}
   */
  getMedia(){
    const {element} = this.props
    let media = element.getResponsiveSetting('content_media');

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
    if (
      element.getResponsiveSetting('content_path') &&
      _.isObject(getDataByPath(element.getResponsiveSetting('content_path'), null, model))
    ) {
      media = getDataByPath(element.getResponsiveSetting('content_path'), null, model);
      /**
       * Проверим массив ли с файлами content_path
       */
      if (_.get(media, "0") instanceof File) {
        media = _.get(media, "0");
      } else {
        media.assetType = "media";
      }
    } else if (
      element.getResponsiveSetting('content_path') &&
      _.isString(getDataByPath(element.getResponsiveSetting('content_path'), null, model))
    ) {
      media = getDataByPath(element.getResponsiveSetting('content_path'), null, model);
      media = {
        assetType: "media",
        url: media,
        name: "null"
      };
    } else if (this.props.element.getResponsiveSetting('default_url')) {
      media = {
        assetType: "media",
        url: this.props.element.getResponsiveSetting('default_url'),
        name: "default"
      };
    }
    return media
  }

  render() {
    const {element} = this.props;
    const cursorPointer = element.getResponsiveSetting("cursor_pointer", false);
    const background_image = element.getResponsiveSetting(
      "background_image",
      {}
    );
    const media = this.getMedia()
    let classNames = "altrp-image-container";
    if (cursorPointer) {
      classNames += " cursor-pointer"
    }

    let width = this.props.element.getResponsiveSetting('width_size');
    let height = this.props.element.getResponsiveSetting('height_size');
    width = _.get(width, 'size', '100') + _.get(width, 'unit', '%');
    height = _.get(height, 'size', '100') + _.get(height, 'unit', '%');

    if (_.get(this.props.element.getResponsiveSetting('height_size'), 'size', '100') === "0") {
      height = ""
    }

    let altrpImage = (
      <AltrpImage
        image={media}
        width={width}
        element={this.props.element}
        height={height}
        className={
          " altrp-image" +
          (background_image ? " altrp-background-image" : "")
        }
      />
    );

    const lightbox = (
      <AltrpLightbox
        images={[(media ? media.url : "")]}
        currentUrl={this.addedURL}
        lightboxID={this.props.element.getResponsiveSetting('l_id')}
        settings={{
          onCloseRequest: () => this.setState({lightbox: false})
        }}
        // color={this.props.color_lightbox_style}
      />
    );



    return (
      <div
        className={classNames}
        onClick={() => {
          if(! isEditor()){
            this.setState({lightbox: true})
          }
        }}
      >
        {
          altrpImage
        }
        {
          this.state.lightbox ? lightbox : ""
        }
      </div>
    );

  }
}

export default ImageLightboxWidget;
