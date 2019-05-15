
import * as React from "react" ;
import { getCssForColumnWithScreenType } from '../../../utils/index';
import { isNull } from 'base-commons-module';
import { EditorTextbox , EditorTextboxProps  } from './EditorTextbox';
import { BaseHtmlComponent , BaseHtmlComponentState  } from '../../BaseHtmlComponent';

export interface EditorTextboxLabeledState extends BaseHtmlComponentState {

}
/**
 * property
 */
export interface EditorTextboxLabeledProps extends EditorTextboxProps {
    /**
     * label untuk di sebelah textbox
     */
    label: string ;

    /**
     * css untuk label. di default:col-xx-4 control-label 
     */
    cssLabel?: string ; 
    
    /**
     * css untuk div textbox. kalau misal di perlukan item tertentu untuk bagian ini 
     */
    cssDivTextbox  ?: string ;
    /**
     * flag di hidden atau tidak
     */
    hidden?: boolean; 

    /**
     * pada label di tambahkan label
     */
    appendDoubleDotOnLabel?: boolean; 
    /**
     * berapa areal yang di pakai untuk textbox. ikut grid system dari bootstrap 12 column
     */
    areaForTextboxWidth?: 1|2|3|4|5|6|7|8|9|10 ; 

    /**
     * flag kalau control perlu di remove
     */
    doNotRenderIf  ?: boolean ; 
}
/**
 * textbox dengan label
 */
export class EditorTextboxLabeled extends BaseHtmlComponent<EditorTextboxLabeledProps , EditorTextboxLabeledState > {
    elementId: string ; 
    /**
     * midle class dari bootstrap
     */
    bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
    /**
     * textbox reference
     */
    textbox: EditorTextbox ; 
    constructor(props: EditorTextboxLabeledProps) {
        super(props) ; 
        this.state = {} ; 
        this.elementId = this.props.id || null! ;
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorTextbox.ID_COUNTER === -1) {
                EditorTextbox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_txt_' + EditorTextbox.ID_COUNTER ;
            EditorTextbox.ID_COUNTER += 1  ;
        }
    }

    shouldComponentUpdate(nextProps: EditorTextboxLabeledProps, nextState: EditorTextboxLabeledState) {
        for ( let k2 of ['className', 'title' , 'readonlyState', 'disabled', 'required' , 'readonlyCssName', 'cssForSpanTextboxWrapper' , 'label', 'cssLabel', 'cssDivTextbox', 'hidden', 'appendDoubleDotOnLabel', 'areaForTextboxWidth', 'doNotRenderIf']) {
            if ( this.props[k2] !== nextProps[k2]) {
                return true ; 
            }
        }
        return false ; 
    }

    /**
     * getter value dari textbox
     */
    get value (): string {
        return this.textbox.state.value ; 
    }
    /**
     * set value ke dalam textbox
     */
    set value ( val: string ) {
        this.textbox.setValue(val) ; 
    }
    
    render () {
        if ( !isNull(this.props.doNotRenderIf) && this.props.doNotRenderIf) {
            return <input type='hidden' />;
        }
        let lbl: string = this.props.label;
        if (isNull(this.props.appendDoubleDotOnLabel) && this.props.appendDoubleDotOnLabel) {
            lbl += " :";
        }
        let bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
        let cssLabel: string = 'col-' + bootstrapColumnClass + '-4 control-label';
        let cssDivTextbox: string = 'col-' + bootstrapColumnClass + '-8';
        if ( this.props.cssLabel) {
            cssLabel = this.props.cssLabel  ; 
        }
        if ( this.props.cssDivTextbox) {
            cssDivTextbox = this.props.cssDivTextbox ;
        }
        let spanTxtCss: string = null! ; 
        let renderedChildren: any[] = [] ; 
        if ( !isNull(this.props.children)) {
            let txtWidth: number = 11 ; 
            let childWidth: number = 1 ; 
            if ( !isNull(this.props.areaForTextboxWidth)) {
                let s: any = this.props.areaForTextboxWidth ; 
                s = s / 1 ; 
                txtWidth = s ; 
                childWidth = 12 - s ; 
            }
            spanTxtCss = 'col-' + this.bootstrapColumnClass + '-' + txtWidth  ; 
            renderedChildren = [<span key='wrapper_children' className={'col-' + this.bootstrapColumnClass + '-' + childWidth}>{this.props.children}</span>]; 
        }
        let ttl: string = '' ; 
        if (this.props.title) {
            ttl = this.props.title ; 
        }
        return (
            <div className="form-group" style={{display: this.props.hidden ? 'none' : ''}} title={ttl}>
                <label className={cssLabel} htmlFor={this.elementId}><strong>{lbl}</strong></label>
                    <div   
                        className={cssDivTextbox}
                        style={{textAlign: 'left'}}
                    >
                        <EditorTextbox 
                            defaultValue={this.props.defaultValue}
                            cssForSpanTextboxWrapper={spanTxtCss}
                            bindValueToFormOnChange={this.props.bindValueToFormOnChange}
                            inputType={this.props.inputType}
                            changeHandler={this.props.changeHandler}
                            className={this.props.className}
                            fieldName={this.props.fieldName}
                            registrarMethod={this.props.registrarMethod}
                            maxLength={this.props.maxLength}
                            readonlyState={this.props.readonlyState}
                            tabIndex={this.props.tabIndex}
                            id={this.elementId}
                            title={this.props.title}
                            onBlur={this.props.onBlur}
                            disabled={this.props.disabled}
                            required={this.props.required}
                            onFocus={this.props.onFocus}
                            variableName={this.props.variableName}
                            readonlyCssName={this.props.readonlyCssName}
                            registerVariableMethod={this.props.registerVariableMethod} 
                            customAssignValueToData={this.props.customAssignValueToData}
                            customFetchValueFromData={this.props.customFetchValueFromData}
                            ref={( d: any ) => {
                                this.textbox = d !; 
                            }}
                        />{renderedChildren}
                    </div>
                </div>

        );
    }
}
