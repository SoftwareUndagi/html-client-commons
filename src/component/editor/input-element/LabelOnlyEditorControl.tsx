
import * as React from "react" ;
import { isNull } from 'base-commons-module' ; 
import {  getCssForColumnWithScreenType } from '../../../utils/index';
import { BaseHtmlComponent } from "../../BaseHtmlComponent";
export interface LabelOnlyEditorControlProps {

    /**
     * nama class yang di pakai textbox
     */
    className?: string ;

    /**
     * title untuk hint dalam textbox
     */
    title?: string ;
    /**
     * element children dari data
     */
    children ?: any ; 
    /**
     * label untuk di sebelah textbox
     */
    label: string;
    /**
     * for utnuk element
     */
    htmlFor?: string; 

    /**
     * label yang perlu di tampilkan
     */
    value: string |JSX.Element; 

    /**
     * css untuk label. di default:col-xx-4 control-label 
     */
    cssLabel?: string ; 

    /**
     * css untuk div textbox. kalau misal di perlukan item tertentu untuk bagian ini 
     */
    cssDivTextbox  ?: string ;

    /**
     * css untuk span readonly
     */
    spanReadonlyCssName ?: string ; 
    /**
     * flag di hidden atau tidak
     */
    hidden?: boolean ; 

    /**
     * untuk tidak merender data dengan conditional
     */
    doNotRenderIf  ?: boolean ; 
}
export interface LabelOnlyEditorControlState {}

export class LabelOnlyEditorControl  extends BaseHtmlComponent<LabelOnlyEditorControlProps , LabelOnlyEditorControlState > {

    cssLabel: string ;
    cssDivTextbox: string ;
    keyPrefix: string = 'span_auto_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 1000);
    
    /**
     * css untuk span
     */
    spanReadonlyCssName: string = 'labelOnView';
    constructor(props: LabelOnlyEditorControlProps) {
        super(props) ; 
        let  bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
        this.cssLabel = 'col-' + bootstrapColumnClass + '-4 control-label';
        this.cssDivTextbox = 'col-' + bootstrapColumnClass + '-8' ; 
        this.state = {} ;
        if ( props.cssLabel != null && typeof props.cssLabel !== 'undefined' && props.cssLabel !== '' ) {
            this.cssLabel = props.cssLabel ; 
        }
        if ( props.cssDivTextbox != null && typeof props.cssDivTextbox !== 'undefined' && props.cssDivTextbox !== '' ) {
            this.cssDivTextbox = props.cssDivTextbox ; 
        }  
        if (props.spanReadonlyCssName != null && typeof props.spanReadonlyCssName !== 'undefined') {
            this.spanReadonlyCssName = props.spanReadonlyCssName ; 
        } 
    }
    render () {
        if ( !isNull(this.props.doNotRenderIf) && this.props.doNotRenderIf) {
            return <input type='hidden'  />;
        }
        return (
            <div className="form-group" style={{ display: this.props.hidden ? 'none' : '' }} key={this.keyPrefix + '_outmost'}>
                <label className={this.cssLabel} htmlFor={this.props.htmlFor} key={this.keyPrefix + '_label'}><strong>{this.props.label}</strong></label>
                <div  
                    key={this.keyPrefix + '_control_div'} 
                    className={this.cssDivTextbox}
                    style={{textAlign: 'left'}}
                >
                    <span  className={this.spanReadonlyCssName}>
                        {this.props.children}
                        {this.props.value}
                    </span>
                </div>
            </div>
        );
    }
}