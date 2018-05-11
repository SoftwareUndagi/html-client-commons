import * as React from "react" ;
import { EditorInputElement } from './CommonsInputElement'; 
import { BaseHtmlComponent } from "../../BaseHtmlComponent";

export interface VirtualInputElementState {}
export interface VirtualInputElementProps {
    /**
     * 
     */
    assignDataToControl:  (data: any ) => any ;
    /**
     * membaca data dari control
     */
    fetchDataFromControl:  (data: any  ) => any ; 

    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: VirtualInputElement , unregFlag ?: boolean ) => any ;
}

export class VirtualInputElement  extends BaseHtmlComponent<VirtualInputElementProps , VirtualInputElementState> implements EditorInputElement {

    constructor(props: VirtualInputElementProps ) {
        super(props);
        if ( props.registrarMethod != null && typeof  props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , false ); 
        }
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean ) {
      this.props.assignDataToControl(data) ; 
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
        this.props.fetchDataFromControl(data) ;  
    }

    render() {
        return <input type='hidden'/>; 
    }

}