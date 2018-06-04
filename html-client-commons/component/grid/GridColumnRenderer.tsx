import * as React from "react" ;
import { CommonCommunicationData , isNull, readNested,   BaseComponent } from 'core-client-commons/index';
import { FormatterUtils } from '../../utils/FormatterUtils';
import { GridColumnProps , GridDataAlign } from './SimpleGridMetadata';

/**
 * ini untuk renderer column
 */
export interface GridColumnRendererProps<DATA>  {
    columnDefinition:  GridColumnProps<DATA> ; 
    data: DATA ; 
    rowNumber: number ; 

    /**
     * unit dari lebar. px, pct atau pt
     */
    columnWidthUnit: '%'|'px'|'pt';

    /**
     * command untuk update state dari grid
     */
    updateGridStateCommand: () => any  ; 

    /**
     * provider row state
     */
    requestRowStateCommand: (rowIndex: number ) => any ; 
    /**
     * data lookup sesuai dalam definisi dari grid. ini di pergunakan dalam kasus column definition berisi lookupId
     */
    gridDataJoinedLookups: {[id: string]: { [id: string]:  CommonCommunicationData.CommonLookupValue} }; 
    /**
     * container lookup
     */
    lookupContainer:  {[id: string]: CommonCommunicationData.CommonLookupValue[]} ; 
}
/**
 * renderer column
 */
export class GridColumnRenderer<DATA> extends BaseComponent<GridColumnRendererProps<DATA> , any > {

    constructor(props: GridColumnRendererProps<DATA>) {
        super(props) ; 
        this.state = {
            //
        };
    }

    render(): JSX.Element {
        let styAl: React.CSSProperties = {} ; 
        let val: any = readNested(this.props.data , this.props.columnDefinition.fieldName) ;
        let align: any = this.props.columnDefinition.align; 
        let cssCol: string = '' ; 
        if ( !isNull( this.props.columnDefinition.rowCssNameProvider)) {
            cssCol = this.props.columnDefinition.rowCssNameProvider!(this.props.rowNumber % 2 === 0) ; 
        }
        let tdAttr: React.HTMLAttributes<any> = {
            style: styAl,
            className: cssCol 
        }; 
        if (!isNull(this.props.columnDefinition.width)) {
            styAl.width = this.props.columnDefinition.width + this.props.columnWidthUnit;
        }
        let st: any = {};
        if (!isNull(this.props.columnDefinition.customColumnStyleProvider)) {
            st = this.props.columnDefinition.customColumnStyleProvider!(this.props.data, this.props.rowNumber);
            if (!isNull(st)) {
                tdAttr.style = st; 
            }
        }
        if ( !isNull(this.props.columnDefinition.numberAsCurrencyFormatter)) {
            if ( isNull(tdAttr.style)) {
                tdAttr.style = {} ; 
            }
            tdAttr.style!.textAlign = 'right' ; 
            return (
            <td
                {...tdAttr}
                key={'automate_col_' + this.props.rowNumber}
            >
                {(() => {
                    if ( !isNull(this.props.columnDefinition.customDataFormatter)) {
                        return this.props.columnDefinition.customDataFormatter!({
                            data : this.props.data , 
                            gridType : 'standard' , 
                            rowIndex : this.props.rowNumber , 
                            lookupContainers : this.props.lookupContainer , 
                            selectedData : false , 
                            updateGridStateCommand : this.props.updateGridStateCommand, 
                            rowState : this.props.requestRowStateCommand(this.props.rowNumber)
                        });
                    } else {
                        let f: FormatterUtils = new FormatterUtils() ; 
                        if ( isNull(val)) {
                            val = 0 ;
                        }
                        if ( isNaN(val)) {
                            val = 0 ;
                        }
                        try {
                            let s: any  = f.formatMoney( val ,    this.props.columnDefinition.numberAsCurrencyFormatter!.useDotTousandSeparator , this.props.columnDefinition.numberAsCurrencyFormatter!.remainedFraction) ;
                            val = s ; 
                        } catch ( exc ) {
                            console.error('Gagal memformat money untuk : ' , val , '.Error : ' , exc ) ; 
                        }
                        return <span>{val}</span>;
                    }
                })()}
            </td>
            );
        } else {
            if ( !isNull(this.props.columnDefinition.align)) {
                if ( this.props.columnDefinition.align === GridDataAlign.center) {
                    styAl.textAlign = 'center';
                } else if ( align === GridDataAlign.right) {
                    styAl.textAlign = 'right';
                }
            }
            
            let renderedVal: string = ''; 
            if ( !isNull(this.props.columnDefinition.lookupParameter)) {
                let lookupVal: {[id: string]:  CommonCommunicationData.CommonLookupValue} = null !; 
                if ( !isNull(this.props.gridDataJoinedLookups)) {
                    lookupVal = this.props.gridDataJoinedLookups[this.props.columnDefinition.lookupParameter!.lookupId];
                }
                if ( !isNull(this.props.columnDefinition.lookupParameter!.customColumnFormatter)) {
                    return this.props.columnDefinition.lookupParameter!.customColumnFormatter!(this.props.data , lookupVal );
                } else if ( !isNull(this.props.columnDefinition.lookupParameter!.customValueFormatter)) {
                    renderedVal = this.props.columnDefinition.lookupParameter!.customValueFormatter!(this.props.data , lookupVal);
                } else {
                    renderedVal = val ; 
                    if ( !isNull(lookupVal)) {
                        let lk: CommonCommunicationData.CommonLookupValue = lookupVal[val] ; 
                        if ( !isNull(lk)) {
                            renderedVal = lk.detailCode + ' - ' + lk.label ;
                        }
                    }
                }
            } else if ( !isNull(this.props.columnDefinition.customValueFormatter)) {
                let rawData: any = this.props.data; 
                renderedVal = this.props.columnDefinition.customValueFormatter!({
                    rawData: rawData , 
                    originalLabel : val , 
                    rowIndex : this.props.rowNumber , 
                    lookupContainers : this.props.lookupContainer , 
                    rowState : this.props.requestRowStateCommand(this.props.rowNumber ) , 
                    selectedData : false  // val ,rawData
                });
            } else if (  !isNull(this.props.columnDefinition.dateValueFormatter)) {
                let f: FormatterUtils = new FormatterUtils() ; 
                renderedVal  = '' ; 
                if ( !isNull( this.props.columnDefinition.dateValueFormatter!.datePattern) && this.props.columnDefinition.dateValueFormatter!.datePattern.length > 0) {
                    renderedVal = f.formatDate(val , this.props.columnDefinition.dateValueFormatter!.datePattern);
                }
                if ( !isNull( this.props.columnDefinition.dateValueFormatter!.timePattern) && this.props!.columnDefinition!.dateValueFormatter!.timePattern!.length > 0 ) {
                    if ( renderedVal.length > 0 ) {
                        renderedVal += ' ';
                    }
                    renderedVal += f.formatTime(val , this.props.columnDefinition.dateValueFormatter!.timePattern!);
                }
            } else if ( !isNull(this.props.columnDefinition.numberAsCurrencyFormatter)) {
                let f: FormatterUtils = new FormatterUtils() ;
                renderedVal  = f.formatMoney(val , this.props.columnDefinition.numberAsCurrencyFormatter!.useDotTousandSeparator , this.props.columnDefinition.numberAsCurrencyFormatter!.remainedFraction);
            } else if ( !isNull(this.props.columnDefinition.customDataFormatter)) {
                let s: any = this.props.columnDefinition.customDataFormatter!({
                    data : this.props.data , 
                    gridType : 'standard'  , 
                    rowIndex : this.props.rowNumber , 
                    rowState : this.props.requestRowStateCommand(this.props.rowNumber) , 
                    selectedData : false , 
                    lookupContainers : this.props.lookupContainer , 
                    updateGridStateCommand : this.props.updateGridStateCommand 

                }) ;
                renderedVal = s ; 
            } else {
                renderedVal = val ; 
            }
            return (
            <td
                {...tdAttr}
                key={'automate_col_' + this.props.rowNumber}
            >
                {renderedVal}
            </td>);  
           
        }
    }
}