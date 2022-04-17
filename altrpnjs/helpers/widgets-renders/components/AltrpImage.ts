import _ from "lodash";
import objectToStylesString from "../../objectToStylesString";
import getResponsiveSetting from "../../getResponsiveSetting";
import get_altrp_setting from "../../get_altrp_setting";

export default function AltrpImage(props: any, device: string) {
  const {settings, widgetId, image} = props
  const {lazyload_disable,} = settings
  if (lazyload_disable) {
    let src = _.get(settings, 'content_media.dataUrl') || _.get(settings, 'content_media.url')
    if (src) {
      src = `src="${src}"`
    } else {
      src = `scr="/img/nullImage.png"`
    }
    return `<img class="altrp-image" width="${props.width}" height="${props.height}" ${src}/>`
  }


  let placeholderStyles: any = {
    position: 'relative',
    maxWidth: '100%',
    overflow: 'hidden',
    width: _.isNumber(props.width) ?
      props.width + 'px' : props.width ? props.width : '100%',
  }

  const altrpSkeletonColor = get_altrp_setting( 'altrp_skeleton_color', '#ccc' )
  const altrpSkeletonHighlightColor = get_altrp_setting( 'altrp_skeleton_highlight_color', '#d0d0d0' )
  let addingStyles = `<style class="altrp-image-placeholder_${widgetId}-styles">.altrp-element${widgetId} .altrp-image-placeholder::before{display: block;
  content: '';
  width: 100%;
${function () {
    const {settings, height} = props;
    let style = '';
    const aspect_ratio_size = getResponsiveSetting(settings, 'aspect_ratio_size', device);
    if (Number(aspect_ratio_size) !== 0) {
      if (aspect_ratio_size === 'custom') {
        let custom_aspect = getResponsiveSetting(settings, 'custom_aspect', device);
        custom_aspect = Number(custom_aspect) || 100;
        style += `padding-top:${custom_aspect}%;`;
      } else if (Number(aspect_ratio_size)) {
        style += `padding-top:${aspect_ratio_size}%;`;
      }
      return style;
    }
    if (height && _.isString(height) && height.indexOf('%') === -1) {
      return style;
    }
    if (Number(image?.width) && Number(image?.height)) {
      style += `padding-top:${(props.image?.height / props.image?.width) * 100}%;`
    }
    return style;
  }()};}.altrp-element${widgetId}.altrp-element${widgetId} .altrp-skeleton,.altrp-element${widgetId}.altrp-element${widgetId} .altrp-image{position:absolute;top:0;left:0;right:0;bottom:0;height:100%;width:100%;}
  .altrp-element${widgetId} .altrp-skeleton__span{background-color: ${altrpSkeletonColor};
   background-image:linear-gradient(90deg,${altrpSkeletonColor},${altrpSkeletonHighlightColor},${altrpSkeletonColor});}
  </style>
`
  placeholderStyles = objectToStylesString(placeholderStyles)
  return `${addingStyles}<div class="altrp-image-placeholder" width="${props.width}" style="${placeholderStyles}" height="${props.height}"> <span class="altrp-skeleton__span"></span></div>`
}
