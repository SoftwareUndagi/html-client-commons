import * as React from 'react';
import { readNested , isNull , FormatterUtils , } from '../../../utils/index';
import { CommonCommunicationData , DateUtils } from 'core-client-commons';
import { JqGridColumnProps,   JqGridButtonProps } from './GridPanelComponent';
import { BaseHtmlComponent } from '../../BaseHtmlComponent';

export { JqGridColumnProps, JqGridButtonProps  } from './GridPanelComponent';
/**
 * untuk di pergunakan element grid
 */
export class JqGridColumn<DATA> extends BaseHtmlComponent<JqGridColumnProps<DATA>, any> {

    render(): JSX.Element {
        return <input type='hidden' key={'column_def_' + this.props.fieldName} id={'column_def_' + this.props.fieldName} />;
    }
}
/**
 * untuk di pergunakan element grid
 */
export class GridButton<DATA> extends BaseHtmlComponent<JqGridButtonProps<DATA>, any> {

    render(): JSX.Element {
        return <input type='hidden'  /> ;
    }
}

/**
 * generator Yes NO dengan check mark
 */
export function GRID_FORMATTER_YES_NO (fieldName: string ): (data: any, rowIndex: number, selectedData: boolean) => JSX.Element {
    return (data: any, rowIndex: number, selectedData: boolean): JSX.Element => {
        let val: string = readNested(data , fieldName) ; 
        if ( val === 'Y' || val === 'y') {
            return <i className="fa fa-check-square-o">{}</i>; 
        }
        return <i className="fa fa-square-o"/>; 
    };
}

export function GRID_FORMATTER_DATE (fieldName: string ): (data: any, rowIndex: number, selectedData: boolean) => JSX.Element {
    return (data: any, rowIndex: number, selectedData: boolean): JSX.Element => {
        let val: Date = readNested(data , fieldName) ;
        if ( typeof val === 'string') {
            val = new Date(val); 
        }
        let rdreString: string = '';  

        if ( !isNull(val) && ! isNull(val.getTime)   && !isNaN(val.getTime())) {
            rdreString =  DateUtils.formatDate(val , 'dd/mm/yyyy');
        }
        return <span>{rdreString}</span>; 
    };
    // return boolVar? `<i class="fa fa-check-square-o"></i>` : `<i class="fa fa-square-o"></i>`
}

/**
 * data di return dengan format code "-" + label
 */
export function GRID_FORMATTER_LOOKUP_RETURN_CODE_LABEL  (  lookupCode: string ): (originalLabel: any , rawData: any, rowIndex: number, selectedData: boolean , lookupContainers: {[id: string]: CommonCommunicationData.CommonLookupValue[]}) => string  {
    return (originalLabel: any , rawData: any, rowIndex: number, selectedData: boolean , lookupContainers: {[id: string]: CommonCommunicationData.CommonLookupValue[]}) => {
        let lks: CommonCommunicationData.CommonLookupValue[] = lookupContainers[lookupCode]; 
        let mtchLk: CommonCommunicationData.CommonLookupValue = null! ; 

        for ( let l of lks  ) {
            if ( originalLabel + '' === l.detailCode) {
                mtchLk = l ; 
                break ; 
            }
        }
        if ( !isNull(mtchLk)) {
            return mtchLk.detailCode + ' - ' + mtchLk.label; 
        }
        return originalLabel + '' ; 
    };
}

/**
 * return hanya label dari lookup
 */
export function GRID_FORMATTER_LOOKUP_RETURN_LABEL_ONLY  (  lookupCode: string ): (originalLabel: any , rawData: any, rowIndex: number, selectedData: boolean , lookupContainers: {[id: string]: CommonCommunicationData.CommonLookupValue[]}) => string  {
    // (  lookupCode: string ): (originalLabel: any , rawData: any, rowIndex: number, selectedData: boolean , lookupContainers: {[id: string]: CommonCommunicationData.CommonLookupValue[]}) =>
    // (originalLabel: any , rawData: any, rowIndex: number, selectedData: boolean , lookupContainers: {[id: string]: CommonCommunicationData.CommonLookupValue[]}) =>
    return (originalLabel: any , rawData: any, rowIndex: number, selectedData: boolean , lookupContainers: {[id: string]: CommonCommunicationData.CommonLookupValue[]}) => {
        let lks: CommonCommunicationData.CommonLookupValue[] = lookupContainers[lookupCode]; 
        let mtchLk: CommonCommunicationData.CommonLookupValue = null! ; 
        for ( let l of lks  ) {
            if ( originalLabel + '' === l.detailCode) {
                mtchLk = l ; 
                break ; 
            }
        }
        if ( !isNull(mtchLk)) {
            return mtchLk.label!; 
        }
        return originalLabel + '' ; 
        
    };
}
export function GRID_FORMATTER_MONEY (fieldName: string ): (data: any, rowIndex: number, selectedData: boolean) => JSX.Element {
    return (data: any, rowIndex: number, selectedData: boolean): JSX.Element => {
        let val: number = readNested(data , fieldName) ;
        let rdreString: string = '';  
        if ( isNull(val) || isNaN(val)   ) {
            let fmt: FormatterUtils = new FormatterUtils(); 
            rdreString =  fmt.formatMoney(val);
        }
        return <div style={{textAlign: 'right' , width: '100%' }}>{rdreString}</div>; 
    };
}