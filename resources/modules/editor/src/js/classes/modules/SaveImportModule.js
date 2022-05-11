import BaseModule from "./BaseModule";
import Resource from "../Resource";
import {
  getEditor,
  getTemplateDataStorage,
  getTemplateId
} from "../../helpers";
import CONSTANTS from "../../consts";
import store from "../../store/store";
import { changeTemplateStatus } from "../../store/template-status/actions";
import { setTitle } from "../../../../../front-app/src/js/helpers";
import { setTemplateData } from "../../store/template-data/actions";
import ElementsFactory from "./ElementsFactory";
import {
  getSheet,
  stringifyStylesheet
} from "../../../../../front-app/src/js/helpers/elements";

class SaveImportModule extends BaseModule {
  constructor(modules) {
    super(modules);

    this.resource = new Resource({
      route: "/admin/ajax/templates"
    });
    this.globalStorageResource = new Resource({
      route: "/admin/ajax/global_styles"
    });
  }

  /**
   * Загружаем шаблон
   */
  load(getDataIfExits) {
    if (getDataIfExits && this.data) {
      setTitle(this.data.title);
      let data = JSON.parse(this.data.data);
      store.dispatch(setTemplateData(this.data));
      let templateDataStorage = getEditor().modules.templateDataStorage;
      templateDataStorage.setType(this.data.template_type);
      let parsedData = this.modules.elementsFactory.parseData(data);
      templateDataStorage.setTitle(this.data.title);
      templateDataStorage.replaceAll(parsedData);
      templateDataStorage.setName(this.data.name);
      getEditor().endLoading();
      store.dispatch(changeTemplateStatus(CONSTANTS.TEMPLATE_UPDATED));
      return
    }

    this.template_id = getTemplateId();

    store.dispatch(changeTemplateStatus(CONSTANTS.TEMPLATE_SAVING));
    if (this.template_id) {
      let res = this.resource
        .get(this.template_id)
        .then(templateData => {
          setTitle(templateData.title);
          let data = JSON.parse(templateData.data);
          this.data = templateData
          store.dispatch(setTemplateData(templateData));
          let templateDataStorage = getEditor().modules.templateDataStorage;
          templateDataStorage.setType(templateData.template_type);
          let parsedData = this.modules.elementsFactory.parseData(data);
          templateDataStorage.setTitle(templateData.title);
          templateDataStorage.replaceAll(parsedData);
          templateDataStorage.setName(templateData.name);
          getEditor().endLoading();
          store.dispatch(changeTemplateStatus(CONSTANTS.TEMPLATE_UPDATED));
        })
        .catch(err => {
          console.error(err);
          store.dispatch(changeTemplateStatus(CONSTANTS.TEMPLATE_UPDATED));
        });
    }
  }

  /**
   * Сохраняем шаблон
   */
  saveTemplate() {
    store.dispatch(changeTemplateStatus(CONSTANTS.TEMPLATE_SAVING));
    let html_content = "";
    let stylesElements = [];
    let rootElement = null;
    if (window.altrpEditorContent.editorWindow.current) {
      rootElement = window.altrpEditorContent.editorWindow.current.getElementsByClassName(
        "sections-wrapper"
      )[0];
      if (rootElement) {
        rootElement = rootElement.cloneNode(true);
        _.toArray(rootElement.getElementsByClassName("overlay")).forEach(
          overlayElement => {
            overlayElement.remove();
          }
        );
        _.toArray(
          rootElement.getElementsByClassName("column-empty-plus")
        ).forEach(overlayElement => {
          overlayElement.remove();
        });
        _.forEach(rootElement.querySelectorAll("[id]"), item => {
          item.removeAttribute("id");
        });
        html_content = rootElement.outerHTML;
      }
      stylesElements = window.altrpEditorContent.editorWindow.current
        .getRootNode()
        .getElementById("styles-container")?.children;
      stylesElements = _.toArray(stylesElements);
      stylesElements = stylesElements.filter(style => {
        return style.tagName === "STYLE";
      });

      let styledTag = window.altrpEditorContent.editorWindow.current
        .getRootNode()
        .querySelector('[data-styled="active"]');
      if (styledTag) {
        const contentDocument = styledTag.getRootNode();

        const _styledTag = styledTag.cloneNode(true);
        _styledTag.removeAttribute("data-styled");
        _styledTag.removeAttribute("data-styled-version");
        _styledTag.innerHTML = stringifyStylesheet(
          getSheet(styledTag, contentDocument)
        );
        stylesElements.push(_styledTag);
      }

      stylesElements = stylesElements.map(style =>
        style ? style.outerHTML : ""
      );
    }
    let templateData = getEditor().modules.templateDataStorage.getTemplateDataForSave();
    templateData.html_content = html_content;
    if (stylesElements.length) {
      templateData.styles = {
        all_styles: stylesElements,
        important_styles: stylesElements
      };
    }
    this.resource
      .put(this.template_id, templateData)
      .then(res => {
        store.dispatch(changeTemplateStatus(CONSTANTS.TEMPLATE_UPDATED));
        rootElement && rootElement.remove();
      })
      .catch(err => {
        console.error(err);
        store.dispatch(changeTemplateStatus(CONSTANTS.TEMPLATE_UPDATED));
        rootElement && rootElement.remove();
      });
  }

  /**
   * Сохраняем настройки корневого элемента в бд, таблица altrp_global_styles
   */
  async saveRootElementSettings() {
    const rootElement = getTemplateDataStorage().getRootElement();
    const title = rootElement.getSettings("settings_save_title");
    if (!title) {
      return {
        success: false,
        message: "Global Style Title"
      };
    }
    const data = rootElement.getSettings();
    return this.globalStorageResource.post({
      data,
      title
    });
  }

  /**
   * Импортируем глобальные настройки в настройки текущего шаблона
   * @return {Promise<{success: boolean, message: string}>}
   */
  async importGlobalSettings() {
    const rootElement = getTemplateDataStorage().getRootElement();
    const globalSettingId = rootElement.getSettings("settings_choose");
    const oldChoosePage = rootElement.getSettings("choose_page");
    if (!globalSettingId) {
      return {
        success: false,
        message: "Global Style not Selected"
      };
    }
    const globalStyle = (await this.globalStorageResource.get(globalSettingId))
      .data;

    _.set(globalStyle.data, "choose_page", oldChoosePage);
    rootElement.setSettings(globalStyle.data);
    rootElement.updateStyles();
    return {
      success: true
    };
  }
}

export default SaveImportModule;
