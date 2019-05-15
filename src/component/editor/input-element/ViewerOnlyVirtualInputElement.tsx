
import * as React from "react" ;
import { isNull } from 'base-commons-module';
import { EditorInputElement } from './CommonsInputElement'; 
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';

export interface ViewerOnlyVirtualInputElementState extends BaseHtmlComponentState {
    value: string ; 
}

export interface ViewerOnlyVirtualInputElementProps extends BaseHtmlComponentProps {

    /**
     * css untuk span
     */    
    cssName ?: string ; 

    /**
     * nama variable . untuk di fetch dari control
     */
    variableName: string ; 

    /**
     * custom data renderer. kalau perlu formatting khusus
     */
    customDataRenderer ?: (data: any ) => string ; 
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: ViewerOnlyVirtualInputElement , unregFlag?: boolean ) => any ;

}

export class ViewerOnlyVirtualInputElement  extends BaseHtmlComponent<ViewerOnlyVirtualInputElementProps , ViewerOnlyVirtualInputElementState> implements EditorInputElement {

    constructor(props: ViewerOnlyVirtualInputElementProps) {
        super(props) ; 
        this.state = {value : ''}; 
        if (  props.registrarMethod != null && typeof   props.registrarMethod !== 'undefined') {
            props.registrarMethod(this , false ); 
        }
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean ) {
        let f: string =  this.props.customDataRenderer != null && typeof this.props.customDataRenderer !== 'undefined' ? this.props.customDataRenderer(data ) :  data[this.props.variableName] || null ;
        if ( isNull(f)) {
            f = '' ; 
        }
        if ( !isNull(updateState) && !updateState) {
            let s: any = this.state ; 
            s.value = f; 
        } else {
            this.setStateHelper ( st => st.value = f ); 
        }
    } 
    /**
     * worker untuk unreg panel. di sini detach input dari editor
     */
    componentWillUnmount() {
        if ( this.props.registrarMethod != null && typeof  this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , true ); 
        }
    }
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
       //
    }

    render() {
        return <span className={this.props.cssName}>{this.state.value}</span>; 
    }

}