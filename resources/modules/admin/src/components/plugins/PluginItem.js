import React, {Component} from "react";
import {Button, Icon, Tooltip} from "@blueprintjs/core";
import Resource from "../../../../editor/src/js/classes/Resource";
import compareVersions from "compare-versions";

class PluginItem extends Component {
  state = {};
  updatePlugin = async () => {
    const {plugin} = this.props
    let result = await (new Resource({route: '/admin/ajax/plugins/update_plugin_files'}))
      .post({
        name: plugin.name,
        version_check: true,
      })

    if(result.success && this.props.updatePlugins) {
      this.props.updatePlugins();
    }
  }
  checkVersion = async () => {
    const {plugin} = this.props
    if (!plugin.check_version_url) {
      return
    }
    this.setState(state => ({...state, versionOnCheck: true}))

    let newVersion = await (new Resource({route: plugin.check_version_url}))
      .getQueried({plugin_name: plugin.name}, {
        'Content-Type': 'application/json',
        'Authorization': window.altrpMarketApiToken || ''
      }, true)
    newVersion = newVersion?.data?.version || '0.0.0'
    let canUpdate = compareVersions(newVersion, plugin.version || '0.0.0') > 0 && plugin.update_url;

    this.setState(state => ({...state, versionOnCheck: false, canUpdate}))
  }

  componentDidMount() {
    this.checkVersion()
  }

  componentDidUpdate(prevProps){
    if(prevProps.plugin !== this.props.plugin){
      this.setState(state => ({...state, canUpdate:false}))
    }
  }

  render() {
    const {plugin, _key: key} = this.props
    const {canUpdate,} = this.state
    return (
      <div key={plugin.name} className="col-3 text-center border rounded mx-2">
        <div className="mb-2">{plugin.title} {plugin.version}</div>
        <a href={plugin.url}><img
          className="mb-2"
          src={plugin.logo}
          style={{maxWidth: "150px"}}
          alt=""/></a>
        <div className="custom-control custom-switch">
          <input
            type="checkbox"
            className="custom-control-input"
            id={`switch${key}`}
            checked={plugin.enabled}
            onChange={event => this.props.updateChange(event, key)}/>
          <label
            className="custom-control-label cursor-pointer"
            htmlFor={`switch${key}`}
          >
            {plugin.enabled == true
              ? "Plugin active"
              : "Plugin inactive"}
          </label>
        </div>
        {plugin.check_version_url &&
        <Tooltip content="Check New Version">
          <Button disabled={this.state.versionOnCheck}
                  onClick={this.checkVersion}
                  icon={<Icon icon="refresh"/>}
          />
        </Tooltip>
        }
        {canUpdate &&
        <Tooltip content="Can Upgrade To New Version">
          <Button disabled={this.state.versionOnCheck}
                  onClick={this.updatePlugin}
                  icon={<Icon icon="download"/>}
          />
        </Tooltip>
        }
      </div>
    )
  }

}

export default PluginItem
