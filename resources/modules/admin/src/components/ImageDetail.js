import React from 'react';
import { Form, Field } from 'react-final-form';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CloseIcon from '@material-ui/icons/Close';
import AutoSave from './AutoSaveDocumentDetail';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  #admin {
    overflow: hidden;
  }
`;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export class ImageDetail extends React.Component {
    state = {}

    componentDidUpdate(prevProps) {
        if (prevProps.imageId !== this.props.imageId && this.props.imageId !== null) {
            this.props.getAsset(this.props.imageId).then(data => this.setState(data, () => { this.getAuthorList(this.state.author) }))
        }
    }

    getAuthorList = (id) => {
        this.props.getAuthorList().then(data => {
            let author = data.find(item => item.id == id);
            this.setState({
                authorName: author.name,
            })
        })
    }

    deleteAsset(imageId) {
        this.props.deleteAsset(imageId)
    }

    save = async values => {
        if (values.width !== undefined) {
            this.setState({
                width: values.width
            })
        }
        if (values.height !== undefined) {
            this.setState({
                height: values.height
            })
        }
        await sleep(1000)
    }

    render() {
        const { authorName, url, created_at, filename, media_type, height, width } = this.state

        if (!this.props.imageId) return null;

        return (
            <div>
                <GlobalStyle />
                <div onClick={this.props.closeImageDetail} className="document-detail_opacity-background"></div>
                <div className="document-detail">
                    <div className="document-detail_header">
                        <div className="document-detail__title">Attachment details</div>
                        <div className="document-detail__btn-nav-group">
                            {this.props.havePreviousImage
                                ? <button onClick={this.props.prevImageDetail} className="document-detail__btn-nav"><ArrowBackIosIcon fontSize="small" /></button>
                                : <button onClick={this.props.prevImageDetail} disabled className="document-detail__btn-nav"><ArrowBackIosIcon fontSize="small" /></button>}
                            {this.props.haveNextImage
                                ? <button onClick={this.props.nextImageDetail} className="document-detail__btn-nav"><ArrowForwardIosIcon fontSize="small" /></button>
                                : <button onClick={this.props.nextImageDetail} disabled className="document-detail__btn-nav"><ArrowForwardIosIcon fontSize="small" /></button>}
                            <button onClick={this.props.closeImageDetail} className="document-detail__btn-nav"><CloseIcon fontSize="small" /></button>
                        </div>
                    </div>
                    <div className="document-detail__content">
                        <div className="document-detail__display">
                            <img className="document-detail__image" width={width} height={height} src={url} draggable="false" alt="" />
                            <button className="document-detail__btn document-detail__btn-edit-image">Edit image</button>
                        </div>
                        <div className="document-detail__editing-section">
                            <div className="document-detail__data-wrap">
                                <div className="document-detail__data">
                                    <div>Uploaded on: <span className="document-detail__data-result">{created_at}</span></div>
                                    <div>Uploaded by: <span className="document-detail__data-result">{authorName}</span></div>
                                    <div>File name: <span className="document-detail__data-result">{filename}</span></div>
                                    <div>File type: <span className="document-detail__data-result">{media_type}</span></div>
                                    <div>File size: <span className="document-detail__data-result">7 KB</span></div>
                                    <div>Dimensions: <span className="document-detail__data-result">{height} by {width} pixels</span></div>
                                </div>
                            </div>
                            <Form initialValues={this.state} onSubmit={this.save}>
                                {props => (
                                    <form onSubmit={props.handleSubmit}>
                                        <AutoSave updateAsset={this.props.updateAsset} debounce={1000} save={this.save} />
                                        <div className="document-detail__line-to-change"><span className="document-detail__name-of-changes">Alternative Text</span><Field
                                            name="alternate_text"
                                            label="Alt"
                                            component="input"
                                            type="text"
                                            className="document-detail__input"
                                        /></div>
                                        <div className="document-detail__line-to-change"><span className="document-detail__name-of-changes">Title</span><Field
                                            name="title"
                                            label="Title"
                                            component="input"
                                            type="text"
                                            className="document-detail__input"
                                        /></div>
                                        <div className="document-detail__line-to-change"><span className="document-detail__name-of-changes">Caption</span><Field
                                            name="caption"
                                            label="Caption"
                                            component="textarea"
                                            type="text"
                                            className="document-detail__textarea"
                                        /></div>
                                        <div className="document-detail__line-to-change"><span className="document-detail__name-of-changes">Description</span><Field
                                            name="description"
                                            label="Description"
                                            component="textarea"
                                            type="text"
                                            className="document-detail__textarea"
                                        /></div>
                                        <div className="document-detail__line-to-change"><span className="document-detail__name-of-changes">Width</span><Field
                                            name="width"
                                            label="Width"
                                            component="input"
                                            type="text"
                                            className="document-detail__input"
                                        /></div>
                                        <div className="document-detail__line-to-change"><span className="document-detail__name-of-changes">Height</span><Field
                                            name="height"
                                            label="Height"
                                            component="input"
                                            type="text"
                                            className="document-detail__input"
                                        /></div>
                                        <div className="document-detail__line-to-change_uploated-by">Uploated By<span className="document-detail__name-of-changes__uploated-by">{authorName}</span></div>
                                        <div className="document-detail__line-to-change"><span className="document-detail__name-of-changes">File URL:</span><Field
                                            name="url"
                                            label="File URL"
                                            component="input"
                                            type="text"
                                            className="document-detail__input"
                                        /></div>
                                        <div><CopyToClipboard text={props.values.url}><button className="document-detail__btn document-detail__btn-copy-url">Copy URL to clipboard</button></CopyToClipboard></div>
                                        <div className="document-detail__btn-delete-wrap"><button onClick={() => this.deleteAsset(props.values.id)} className="document-detail__btn-delete">Delete permanently</button></div>
                                    </form >
                                )
                                }
                            </Form>
                        </div >
                    </div >
                </div >
            </div>
        )
    }
}
