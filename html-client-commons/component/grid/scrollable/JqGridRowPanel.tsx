import * as React from 'react';
import { JqGridColumnProps, JqRenderSimpleRowParameter } from './GridPanelComponent';
import { CommonCommunicationData , isNull } from 'core-client-commons'; 
import { JqGridRowColumnPanel } from './JqGridRowColumnPanel';
import { BaseHtmlComponent } from '../../BaseHtmlComponent';

export interface JqGridRowPanelProps<DATA> {
    /**
     * column defs
     */
    columnDefinitions: JqGridColumnProps<DATA>[];
    /**
     * parameter untuk data di render pada row
     */
    dataParameter: JqRenderSimpleRowParameter<DATA>  ; 
    /**
     * container lookup actual yang di pakai oleh grid
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
    /**
     * data lookup sesuai dalam definisi dari grid. ini di pergunakan dalam kasus column definition berisi lookupId
     */
    gridDataJoinedLookups ?: {[id: string]: {[id: string]: CommonCommunicationData.CommonLookupValue} } ; 
    /**
     * id dari grid 
     */
    gridId: string ;
    /**
     * data yang sedang di pilih
     */
    selectedData: DATA;
    /**
     * state dari grid
     * @param rowIndex 
     */
    getGridRowState: ( rowIndex: number ) => any ; 

    /**
     * handler kalau row di pilih
     */
    onRowClick ?: ( data: DATA , rowIndex: number  ) => any ; 
    /**
     * generator custom style untuk row. untuk manipulasi style row dengan kondisi 
     */
    customRowCssStyleGenerator ?: ( data: DATA , rowIndex: number ) => React.CSSProperties ;  
}

export interface JqGridRowPanelState <DATA> {
    //
    dummy ?: DATA ; 
} 
/**
 * panel untuk 1 row jqgrid. tr + row ny
 */
export class JqGridRowPanel<DATA> extends BaseHtmlComponent <JqGridRowPanelProps<DATA> , JqGridRowPanelState <DATA> > {
    constructor(props: JqGridRowPanelProps<DATA>) {
        super(props) ; 
        this.state = {};
    }
    /**
     * update data state. agar grid terupdate
     */
    updateState: () => any =  () => {
        this.setStateHelper (st => {
            //
        });
    }
    /**
     * handler pada saat row click
     */
    onRowClick: () => any  = () => {
        if (this.props.selectedData !== this.props.dataParameter.data) {
            this.props.onRowClick!( this.props.dataParameter.data , this.props.dataParameter.rowIndex) ; 
        }
    }
    /**
     * handler pada saat mouse enter
     */
    onMouseEnter: ( ) => any =  () => {
        let rowIndex: number = this.props.dataParameter.rowIndex;
        let rowId: string = this.props.gridId + '_row_' + rowIndex;
        let cssRow: string = 'ui-widget-content jqgrow ui-row-ltr ';
        if (this.props.dataParameter.data === this.props.selectedData) {
            cssRow += 'ui-state-highlight';
        }
        document.getElementById(rowId)!.className = cssRow + ' ui-state-hover';
    }
    onMouseLeave: () => any =  () => {
        let rowIndex: number = this.props.dataParameter.rowIndex;
        let rowId: string = this.props.gridId + '_row_' + rowIndex;
        let cssRow: string = 'ui-widget-content jqgrow ui-row-ltr ';
        document.getElementById(rowId)!.className = cssRow;
    }
    render (): JSX.Element {
        let data: DATA = this.props.dataParameter.data ; 
        let rowIndex: number = this.props.dataParameter.rowIndex;
        let rowId: string = this.props.gridId + '_row_' + rowIndex;
        let cssRow: string = 'ui-widget-content jqgrow ui-row-ltr ';
        if (data === this.props.selectedData) {
            cssRow += 'ui-state-highlight';
        }
        let cols: any[] = [];
        let colIndex: number = 0;
        let sData: any = data;
        for (let c of this.props.columnDefinitions) {
            let sCol: any = c;
            cols.push((
            <JqGridRowColumnPanel
                data={sData}
                requestGridStateData={this.props.getGridRowState}
                updateGridStateCommand={this.updateState}
                key={'automated_row_' + rowIndex + '_' + colIndex}
                rowNumber={rowIndex}
                columnNumber={colIndex}
                lookupContainer={this.props.lookupContainers}
                gridDataJoinedLookups={this.props.gridDataJoinedLookups!}
                selectedDataFlag={data === this.props.selectedData}
                columnDefinition={sCol} 
            />));
            colIndex++;
        }
        let style: React.CSSProperties = {} ; 
        if ( !isNull (this.props.customRowCssStyleGenerator)) {
            style = this.props.customRowCssStyleGenerator!(this.props.dataParameter.data , this.props.dataParameter.rowIndex) ; 
        }
        return (
        <tr 
            key={'automatic_row_' + rowIndex} 
            role="row" 
            id={rowId} 
            tabIndex={-1}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
            onClick={this.onRowClick}
            className={cssRow}
            style={style}
        >{cols}
        </tr> );
    }
}