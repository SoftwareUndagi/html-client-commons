import * as React from "react" ;
import { isNull } from '../../../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';
export interface SwitcheryWrapperProps extends BaseHtmlComponentProps {
    
    /**
     * value change handler
     */
    changeHandler ?: ( value: boolean ) => any ; 

    /**
     * readonly state dari control
     */
    readonlyState: boolean ; 

    /**
     * state default. checked atau tidak
     */
    defaultChecked?: boolean ; 
    /**
     * tab index dari item
     */
    tabIndex ?: number ; 
    /**
     * id dari element. kalau di pass. ini untuk id element span paling luar
     */
    elementId ?: string ;

}
export interface SwitcheryWrapperState extends BaseHtmlComponentState {
    checked: boolean ; 
}
    
export class SwitcheryWrapper extends BaseHtmlComponent<SwitcheryWrapperProps , SwitcheryWrapperState > {
    elementId: string ; 
    constructor(props: SwitcheryWrapperProps) {
        super(props) ; 
        this.state = {
            checked : false
        };
        this.elementId = 'automatic_switchery_' + new Date().getTime()  ; 
        let swapState: any = this.state ;
        swapState.checked = props.defaultChecked ; 
    }
    
    render (): JSX.Element {
        if ( this.props.readonlyState) {
            if  ( this.state.checked) {
                return this.rendererDisabledChecked(); 
            } else {
                return this.rendererDisabledUnChecked(); 
            }
            
        } else {
            if  ( this.state.checked) {
                return this.rendererEnabledChecked(); 
            } else {
                return this.rendererEnabledUnChecked(); 
            }
        }
    }

    private clickHandler: () => any = ( ) => {
        this.setStateHelper ( 
            st => {
                console.log('[SwitcheryWrapper] click pada element');
                st.checked = !this.state.checked ; 
            } , 
            () => {
                if (this.props.changeHandler) {
                    this.props.changeHandler(this.state.checked);
                }
            });
    }

    /**
     * helper membaca element id. untuk memudahkan mengambil dair props atau predefined id
     */
    private getElementId (): string {
        return isNull(this.props.elementId) ? this.elementId : this.props.elementId! ; 
    }

    private rendererEnabledChecked (): JSX.Element {
        return (
        <span 
            className="switchery switchery-small" 
            id={this.getElementId()} 
            onClick={this.clickHandler}
            style={{
                        backgroundColor: 'rgb(100, 189, 99)' ,  
                        borderColor: 'rgb(100, 189, 99)', 
                        boxShadow: 'rgb(100, 189, 99) 0px 0px 0px 11px inset', 
                        transition: 'border 0.4s, box-shadow 0.4s ,background-color 1.2s'}}
        >
            <small 
                style={{
                    left: '13px', 
                    backgroundColor: 'rgb(255, 255, 255)',
                    transition: 'left 0.2s'}}
            />
        </span>);
    }

    private rendererEnabledUnChecked (): JSX.Element {
        return (
        <span 
            className="switchery switchery-small" 
            id={this.getElementId()} 
            onClick={this.clickHandler}
            style={{
                backgroundColor: 'rgb(255, 255, 255)' ,  
                borderColor: 'rgb(223, 223, 223)', 
                boxShadow: 'rgb(223, 223, 223) 0px 0px 0px 11px inset', 
                transition: 'border 0.4s, box-shadow 0.4s '}}
        >
            <small 
                style={{
                    left: '0px', 
                    backgroundColor: 'rgb(255, 255, 255)',
                    transition: 'left 0.2s'}}
            />
        </span>);
    }

    private rendererDisabledChecked () {
        return (
        <span 
            className="switchery switchery-small"  
            id={this.getElementId()} 
            style={{
                backgroundColor : 'rgb(100, 189, 99) ' , 
                borderColor : 'rgb(100, 189, 99)' , 
                boxShadow : 'rgb(100, 189, 99) 0px 0px 0px 16px inset' , 
                transition : 'border 0.4s, box-shadow 0.4s, background-color 1.2s',
                opacity : 0.5}}
        >
            <small 
                style={{
                            left: '20px', 
                            backgroundColor: 'rgb(255, 255, 255)', 
                            transition: 'background-color 0.4s, left 0.2s'
                        }}
            />
        </span>);
    }

    private rendererDisabledUnChecked () {
        return (
        <span 
            className="switchery switchery-small"  
            id={this.getElementId()} 
            style={{
                        backgroundColor : 'rgb(100, 189, 99) ' , 
                        borderColor : 'rgb(100, 189, 99)' , 
                        boxShadow : 'rgb(100, 189, 99) 0px 0px 0px 16px inset' , 
                        transition : 'border 0.4s, box-shadow 0.4s, background-color 1.2s',
                        opacity : 0.5}}
        >
            <small 
                style={{
                        left: '0px', 
                        backgroundColor: 'rgb(255, 255, 255)', 
                        transition: 'background-color 0.4s, left 0.2s'
                    }}
            />
        </span>);
    }

    /**
     * worker untuk 
     */
    set value ( param: boolean ) {
        if ( this.state.checked !== param ) {
            this.setStateHelper ( st => st.checked = param );
        }
    }

    /**
     * worker untuk get value dari control
     */
    get value (): boolean {
        return this.state.checked ; 
    }
}