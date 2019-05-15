import * as React from "react" ;
import {   isNull , CommonLookupValue  } from 'base-commons-module';
import { BaseHtmlComponent } from "../../BaseHtmlComponent";
/**
 * props untuk combo box
 */
export interface EditorComboboxWrapperProps {
     
    /**
     * nama class yang di pakai textbox
     */
    className: string ;
    /**
     * ID untuk select component. ini kalau di perlukan manipulasi manual
     */
    selectId: string ;

    /**
     * title untuk hint dalam textbox
     */
    title ?: string ;
    /**
     * index dari tab
     */
    tabIndex: number  ;
    /**
     * value dari data current
     */
    value: string ; 
    /**
     * none selected. akan di default ( false)
     */
    appendNoneSelected ?: boolean ;

    /**
     * default akan di isi dengan - silakan pilih - 
     */
    noneSelectedLabel ?: string ;

    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: string ) => any ;
     
    /**
     * data filter. untuk memproses data yang di tampilkan 
     */
    dataFilter ?:   (lookup: CommonLookupValue) => boolean ;
    /**
     * id dari text box
     */
    id?: string ;
    /**
     * flag panel hidden atau tidak
     */
    hidden ?: boolean ; 
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (comboBox: any , unregFlag?: boolean ) => any ;

    /**
     * kode lookup
     */
    lookupCode: string ;
    /**
     * lookup containers
     */
    lookupContainers:  { [id: string ]: CommonLookupValue[]};  
    /**
     * formatter label combo box
     */
    comboLabelFormatter: (lookup: CommonLookupValue) => string ;
    /**
     * element children dari data
     */
    children ?: any ; 
    /**
     * 
     * custom handler untuk assign data to control
     */ 
    customAssignValue?: (data: any, comboBox: any) => any; 
    /**
     * nilai awal untuk lookup
     */
    defaultLookupValues?: CommonLookupValue[];  
    /**
     * nilai awal dari data
     */
    defaultValue  ?: string ; 
}
export interface EditorComboboxWrapperState {}

/**
 * props untuk combo box
 */
export class EditorComboboxWrapper  extends BaseHtmlComponent<EditorComboboxWrapperProps , EditorComboboxWrapperState> {
    
    render () {
        let opts: any[] = [] ; 
        let dataFilter:   (lookup: CommonLookupValue) => boolean = (lookup: CommonLookupValue) => {
            return true ; 
        };
        if ( this.props.dataFilter !== null && typeof this.props.dataFilter !== 'undefined') {
            dataFilter = this.props.dataFilter ; 
        }
        let lks: CommonLookupValue[] = !isNull(this.props.lookupContainers) ?  this.props.lookupContainers[this.props.lookupCode] : null!  ;
        if (isNull(lks)) {
            if (!isNull(this.props.defaultLookupValues)) {
                lks = this.props.defaultLookupValues!; 
            }
        } 
        if ( !isNull(this.props.appendNoneSelected) && this.props.appendNoneSelected ) {
            let lbl: string = '- please select -' ; 
            if ( !isNull(this.props.noneSelectedLabel)) {
                lbl = this.props.noneSelectedLabel! ; 
            }
            opts.push(<option value='' key='opt_none_selected'>{lbl}</option>);
        } 
        if ( lks != null && typeof lks !== 'undefined') {
            let cnt: number = 1 ; 
            for ( let l of lks ) {
                if ( !dataFilter(l)) {
                    continue ; 
                }
                opts.push(<option value={l.detailCode} key={'opt_automate_option_' + cnt}>{this.props.comboLabelFormatter(l)}</option>);
                cnt++ ; 
            }
        }
        let sty: any = {} ; 
        if ( !isNull(this.props.hidden) && this.props.hidden) {
            sty.display = 'none';
        }
        return (
        <select
            style={sty}
            onChange={(evt: any ) => {
                let val: string = evt.target.value ;
                console.log('[EditorComboboxWrapper] change handler triggered dengan value : ' , val ) ; 
                if ( this.props.changeHandler != null && typeof this.props.changeHandler !== 'undefined') {
                    this.props.changeHandler(val );
                } 
                
            }}
            id={this.props.selectId}
            className={this.props.className} 
            defaultValue={this.props.defaultValue}
            value={isNull( this.props.value) ? '' :  this.props.value}
        >{opts}
        </select>);
    }
}