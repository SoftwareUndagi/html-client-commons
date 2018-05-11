import * as React from "react";
import { CommonCommunicationData } from 'core-client-commons';
import { BaseHtmlComponent } from "./BaseHtmlComponent";
import { isNull } from '../utils/index';

export interface SearchableComboBoxDropDownLiProps {

    /**
     * data untuk di render
     */
    data: CommonCommunicationData.CommonLookupValue ; 

    /**
     * index dari data
     */
    rowIndex: number ; 

    /**
     * formatter label combo box
     */
    labelFormatter: (lookup: CommonCommunicationData.CommonLookupValue) => string |JSX.Element ;

    /**
     * handler pada saat item selected
     */
    onItemSelected: (data: CommonCommunicationData.CommonLookupValue ) => any ; 
    /**
     * command untuk close drop down
     */
    closeDropdownCommand: () => any ; 
     /**
      * prefix id dari element
      */
    htmlElementIdPrefix: string ;
    /**
     * kode dari control yang highlighted
     */
    highlightedCode: string ; 
    /**
     * selected data saat ini
     */
    currentSelectedIds: Array<string>  ; 

} 
export interface SearchableComboBoxDropDownLiState {

    /**
     * flag hovered atau bukan
     */
    hovered: boolean ; 
} 
/**
 * panel LI untuk searchable dropdown
 */
export class SearchableComboBoxDropDownLi extends BaseHtmlComponent<SearchableComboBoxDropDownLiProps , SearchableComboBoxDropDownLiState > {

    onMouseEnter: (evt: any ) => any = (evt: any ) => {
        if ( !this.state.hovered) {
            this.setStateHelper( st => {
                st.hovered = true ; 
            }); 
        }
    }
    onMouseLeave: (evt: any ) => any = (evt: any ) => {
        if ( this.state.hovered) {
            this.setStateHelper( st => {
                st.hovered = false ; 
            }); 
        }
    }
    onClick: (evt: any ) => any = (evt: any ) => {
        if ( !isNull(evt.stopPropagation )) {
            evt.stopPropagation(); 
        }
        this.props.onItemSelected(this.props.data); 
        this.props.closeDropdownCommand(); 
    }
    constructor(props: SearchableComboBoxDropDownLiProps) {
        super(props) ; 
        this.state  =  {
            hovered : false 
        };
    }

    render (): JSX.Element {
        let data: CommonCommunicationData.CommonLookupValue = this.props.data ; 
        let ariaSel: 'true'|'false' = "false" ; 
        if ( !isNull(this.props.currentSelectedIds) && this.props.currentSelectedIds.length > 0) {
            if ( this.props.currentSelectedIds.indexOf(this.props.data.detailCode!) >= 0) {
                ariaSel = "true" ; 
            }
        }
        // this.state.hovered ?  "true" :   "false" ; 
        let id: string = data.detailCode + '_' + this.props.htmlElementIdPrefix  ; 
        let css: string = 'select2-results__option ' ; 
        if ( this.props.highlightedCode === this.props.data.detailCode || this.state.hovered) {
            css += 'select2-results__option--highlighted' ; 
        }

        return (
        <li 
            className={css}
            id={id}
            role="treeitem" 
            aria-selected={ariaSel}
            onClick={this.onClick}
            onMouseLeave={this.onMouseLeave}
            onMouseEnter={this.onMouseEnter}
        >{this.props.labelFormatter(data)}
        </li>
        );
    }

}