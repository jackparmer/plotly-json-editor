// React JSON Editor wrapper 
// JSON Editor by Jos de Jong - https://github.com/josdejong/jsoneditor
// Based on post by Hassan Khan - https://github.com/josdejong/jsoneditor/issues/274#issuecomment-263986071
// Wrapper By Ian Grossberg - https://gist.github.com/yoiang/6f82874f4fd8fc1a37631dc9cad27172

import React, { Component, PropTypes } from 'react';
import JSONEditor from 'jsoneditor';

import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
// import './jsoneditor.css';

// Ref: https://github.com/josdejong/jsoneditor/blob/master/docs/api.md
// TODO: ace
// TODO: ajv
// TODO: modes

// TODO: onChange, onEditable, onError
export default class ReactJSONEditor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            json: cloneDeep(props.json),
            editorCreated: false
        };

        this.editor    = null;
        this.editorRef = null;
    }

    get json() {
        return this.state.json;
    }

    componentDidMount() {
        
        if (this.editorRef) {
            this.createJSONEditorComponent(this.editorRef);
        }
    }

    createJSONEditorComponent(container) {
        if (!container) {
            return; 
        }

        const { editorCreated } = this.state;

        if (editorCreated) {
            return;
        }

        const { onChange, onEditable, onError, onModeChange } = this.props;
        const { escapeUnicode, sortObjectKeys, history } = this.props;
        const { mode } = this.props;
        const { name, schema, search, indentation, theme } = this.props;

        let onChangeWrapper;
        if (onChange) {

            onChangeWrapper = () => {
                onChange(this.editor.get());
            };
        }
        this.editor = new JSONEditor(container, {
            onChange: onChangeWrapper, 

            onEditable,
            onError,
            onModeChange,

            escapeUnicode,
            sortObjectKeys,
            history,

            mode,

            name,
            schema,
            search,
            indentation,
            theme
        });
        this.editor.set(this.json);

        const newState = this.state;
        newState.editorCreated = true;
        this.setState(newState);
    }

    componentWillReceiveProps(nextProps) {

        const json = this.json;

        if (!isEqual(json, nextProps.json)) {
            const newState = this.state;
            newState.json = cloneDeep(nextProps.json);
            this.setState(newState);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        this.editor.set(this.json);
    }

    componentWillUnmount() {

        const { editorCreated } = this.state;
        if (editorCreated) {
            
            this.editor.destroy();

            const newState = this.state;
            newState.editorCreated = false;
            this.setState(newState);
        }
    }

    handleChange() {
        // const newState = this.state;
        // newState.json = this.editor.get();
        // this.setState(newState);
    }

    render() {
        const { className, height, width } = this.props;
        
        const refGrabber = (ref) => { 
            this.editorRef = ref; 
        }

        return (
            <div
                id='jsonEditor'
                className={className}
                ref={refGrabber}
                style={ { height, width } }
            />
        );
    }
}

ReactJSONEditor.propTypes = {
    className: PropTypes.string,

    json : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]).isRequired,

    height : PropTypes.number,
    width  : PropTypes.number,

    onChange: PropTypes.func,

    onEditable: PropTypes.func,

    onError: PropTypes.func, 

    onModeChange: PropTypes.func,

    escapeUnicode: PropTypes.bool, 

    sortObjectKeys: PropTypes.bool,

    history: PropTypes.bool,

    mode: PropTypes.oneOf([
        'tree', 'view', 'form', 'code', 'text'
    ]).isRequired,

    name: PropTypes.string,

    schema: PropTypes.object,

    search: PropTypes.bool,

    indentation: PropTypes.number,

    theme: PropTypes.string
};

ReactJSONEditor.defaultProps = {
    escapeUnicode: false,
    sortObjectKeys: false,
    history: true,

    mode: 'tree',

    search: true,

    indentation: 2
}
