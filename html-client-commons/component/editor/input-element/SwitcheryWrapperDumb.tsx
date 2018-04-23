import * as React from "react" ;
import { isNull } from '../../../utils/index';
import { BaseHtmlComponent } from "../../BaseHtmlComponent";

export interface SwitcheryWrapperDumbProps {

    /**
     * status, checked atatu bukan
     */
    checked: boolean ; 
    /**
     * flag state data enabled/disabled
     */
    readonlyState: boolean ; 
    /**
     * toggle check status
     */
    toggleCheck: () => any  ; 
    /**
     * ID dari element
     */
    elementId ?: string ; 

} 
export interface SwitcheryWrapperDumbState {}
export class SwitcheryWrapperDumb extends BaseHtmlComponent< SwitcheryWrapperDumbProps , SwitcheryWrapperDumbState > {
    elementId: string ; 
    constructor(props: SwitcheryWrapperDumbProps) {
        super(props) ; 
        this.state = { };
        this.elementId = 'automatic_switchery_' + new Date().getTime()  ; 
    }
    
    render (): JSX.Element {
        if ( this.props.readonlyState) {
            if  ( this.props.checked) {
                return this.rendererDisabledChecked(); 
            } else {
                return this.rendererDisabledUnChecked(); 
            }
            
        } else {
            if  ( this.props.checked) {
                return this.rendererEnabledChecked(); 
            } else {
                return this.rendererEnabledUnChecked(); 
            }
        }
    }
    private clickHandler: () => any = () => {
        if ( this.props.readonlyState) {
            return ; 
        }
        console.log('[SwitcheryWrapper] click pada element');
        this.props.toggleCheck(); 
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
        </span>
        );
    }

}
