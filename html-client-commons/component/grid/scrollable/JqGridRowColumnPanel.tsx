
import * as React from 'react';
import {  FormatterUtils  } from '../../../utils/index';
import { CommonCommunicationData , isNull , readNested } from 'core-client-commons';
import { GridDataAlign } from '../SimpleGridMetadata';
import { JqGridColumnProps } from './GridPanelComponent';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';
/**
 * ini untuk di pergunakan internal dalam grid. tidak untuk di expose langsung
 */
export interface JqGridRowColumnPanelProps<DATA> extends BaseHtmlComponentProps {
    columnDefinition: JqGridColumnProps<DATA>;
    data: DATA;
    rowNumber: number;
    columnNumber: number;
    selectedDataFlag: boolean;
    /**
     * handler kalau row di click. kalau memerlukan task tertentu ( misal aktivasi button)
     */
    onRowSelectedHandler ?: (data: DATA , rowIndex: number ) => any ; 
    lookupContainer:   {[id: string]: CommonCommunicationData.CommonLookupValue[]};
     /**
      * data lookup sesuai dalam definisi dari grid. ini di pergunakan dalam kasus column definition berisi lookupId
      */
    gridDataJoinedLookups: {[id: string]: { [id: string]:  CommonCommunicationData.CommonLookupValue} };
    /**
     * requestor grid state
     * @param rowIndex index dari data dalam row
     */
    requestGridStateData: ( rowIndex: number ) => any ; 

    /**
     * update state grid
     */
    updateGridStateCommand: () => any ; 
}

export interface JqGridRowColumnPanelState extends BaseHtmlComponentState {

}

/**
 * bagian untuk grid panel
 */
export class JqGridRowColumnPanel<DATA> extends BaseHtmlComponent<JqGridRowColumnPanelProps<DATA>, JqGridRowColumnPanelState> {

    formatterUtils: FormatterUtils ; 
    
    constructor(props: JqGridRowColumnPanelProps<DATA>) {
        super(props);
        this.state = {};
        this.formatterUtils = new FormatterUtils(); 
    }
   
    render(): JSX.Element {
        let lbl: any = isNull(this.props.columnDefinition.fieldName) ? null : readNested(this.props.data, this.props.columnDefinition.fieldName);
        if (!isNull(this.props.columnDefinition.textFormatter)) {
            try {
                lbl = this.props.columnDefinition.textFormatter!({
                    originalLabel: lbl,
                    lookupContainers: this.props.lookupContainer,
                    rawData: this.props.data,
                    rowIndex: this.props.rowNumber,
                    rowState: this.props.requestGridStateData(this.props.rowNumber),
                    selectedData: this.props.selectedDataFlag
                });
            } catch ( exc) {
                lbl = <span title={'Fail to render with custom text,error : ' + exc.message} style={{color : 'red'}}><i>error</i></span>;
            }
            
        } else if (!isNull(this.props.columnDefinition.dateValueFormatter)) {
            if (!isNull(lbl)) {
                let s: any = lbl;
                try {
                    if (isNull(s.getDate) || typeof s.getDate !== 'function') {
                        s = new Date(s);
                    }
                    let rtvl: string = this.formatterUtils.formatDate(s, this.props.columnDefinition.dateValueFormatter!.datePattern);
                    if (!isNull(this.props.columnDefinition.dateValueFormatter!.timePattern)) {
                        rtvl += ' ' + this.formatterUtils.formatTime(s, this.props.columnDefinition.dateValueFormatter!.timePattern!);
                    }
                    lbl = rtvl;
                } catch (exc) {
                    console.error('[JqGridColumnPanel] gagal render column dengan field: ', this.props.columnDefinition.fieldName, ' data : ', lbl, '.error : ', exc);
                }
            }
        } else if (!isNull(this.props.columnDefinition.numberAsCurrencyFormatter)) {
            if (!isNull(lbl)) {
                let procData: any = lbl; 
                if (!isNaN(lbl)) {
                    try {
                        procData = procData / 1;
                        let remainFraction: number = isNull(this.props.columnDefinition!.numberAsCurrencyFormatter!.remainedFraction) ? 2 : this.props.columnDefinition!.numberAsCurrencyFormatter!.remainedFraction;
                        procData = this.formatterUtils.formatMoney(procData, this.props.columnDefinition.numberAsCurrencyFormatter!.useDotTousandSeparator, remainFraction);
                        lbl = procData; 
                    } catch (exc) {
                        console.error('[JqGridColumnPanel] gagal render number.untuk data : ' , lbl , '.error : ' , exc ); 
                    }    
                }
                
            }
        }

        let ttl: string = '';

        if (!isNull(this.props.columnDefinition.gridRowTitleGenerator)) {
            ttl = this.props.columnDefinition.gridRowTitleGenerator!(this.props.data);
        } else {
            if (!isNull(lbl) && typeof lbl === 'string') {
                ttl = lbl + '';
            }

        }
        if (isNull(lbl)) {
            lbl = '';
        } 
        let attr: React.HTMLAttributes<any> = {
            role: "gridcell",
            title: ttl
        };
        if (!isNull(this.props.columnDefinition.align) && this.props.columnDefinition.align !== GridDataAlign.left) {
            let align: any = 'right';
            if (this.props.columnDefinition.align === GridDataAlign.center) {
                align = 'center';
            }
            
            attr.style = { textAlign: align};
        }
        if (isNull(attr.style)) {
            attr.style = { verticalAlign: 'top' };
        } else {
            attr.style!.verticalAlign = 'top';
        }
       
        if  ( !isNull(this.props.rowNumber) && !isNull(this.props.onRowSelectedHandler)) {
            attr.onClick = () => {
                this.props.onRowSelectedHandler!(this.props.data , this.props.rowNumber);
            };
        }

        if ( !isNull(this.props.columnDefinition.lookupParameter)) {
            let lookupVal: {[id: string]:  CommonCommunicationData.CommonLookupValue} = null ! ; 
            if ( !isNull(this.props.gridDataJoinedLookups)) {
                lookupVal = this.props.gridDataJoinedLookups[this.props.columnDefinition.lookupParameter!.lookupId];
            }
            if ( !isNull(this.props.columnDefinition.lookupParameter!.customColumnFormatter)) {
                return  <td {...attr}>{this.props.columnDefinition.lookupParameter!.customColumnFormatter!(this.props.data , lookupVal)}</td>;  
            } else if ( !isNull(this.props.columnDefinition.lookupParameter!.customValueFormatter)) {
                lbl = this.props.columnDefinition.lookupParameter!.customValueFormatter!(this.props.data , lookupVal);
            } else {
                if ( !isNull(lookupVal)) {
                    let lk: CommonCommunicationData.CommonLookupValue = lookupVal[lbl] ; 
                    if ( !isNull(lk)) {
                        lbl = lk.detailCode + ' - ' + lk.label ;
                    }
                }
            }
        } else if (!isNull(this.props.columnDefinition.customFormatter)) {
            return (
            <td {...attr}>{this.props.columnDefinition.customFormatter!({
                updateGridStateCommand: this.props.updateGridStateCommand, 
                data : this.props.data, 
                rowIndex : this.props.rowNumber, 
                selectedData :  this.props.selectedDataFlag , 
                lookupContainers : this.props.lookupContainer  , 
                rowState : this.props.requestGridStateData(this.props.rowNumber), 
                gridType : 'scrollable'

            })}</td>);
        }
        if ( typeof lbl === 'string') {
            attr.dangerouslySetInnerHTML = {__html : lbl} ;
            return <td {...attr} />;
        } else {
            return <td {...attr}>{lbl}</td>;
        }
         
    }
}