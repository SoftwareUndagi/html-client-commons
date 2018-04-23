
import * as React from "react" ;
import { GridColumnProps , ColumnRenderFlag , GridButtonProps   } from './SimpleGridMetadata';
import { CommonCommunicationData , isNull } from 'core-client-commons/index';
import { GridColumnRenderer , GridColumnRendererProps } from './GridColumnRenderer'; 
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../BaseHtmlComponent';
/**
 * property untuk grid
 */
export interface BaseGridProps<DATA> extends  React.Props<any> , BaseHtmlComponentProps {
    /**
     * id untuk table
     */
    tableId: string ; 
    /**
     * append row number atau tidak
     */
    appendRowNumberColumn ?: boolean ; 
    /**
     * unit dari lebar. px, pct atau pt
     */
    columnWidthUnit: '%'|'px'|'pt';
    /**
     * lebar dari column. untuk kerapian layout, anda prlu mengatur lebar dari column
     */
    rowNumberWidth ?: number ; 
    /**
     * css untuk table
     */
    cssName ?: string ;

    /**
     * css untuk thead
     */
    theadCssName ?: string ; 

    /**
     * css untuk row. fungsi dengan asumsi bisa zebra 
     */
    rowCssNameProvider ?: (isOdd: boolean ) =>  string ;

    /**
     * ikut pola nya react. di mandatory ada key
     */
    // key: string; 
    /**
     * conditional. grid di hidden atau tidak
     */
    hidden?: boolean; 

    /**
     * generator custom style untuk row. untuk manipulasi style row dengan kondisi 
     * @param gridType tipe grid untuk di siapkan props, scrollable(jqgrid) , atau default(table)
     * @param data data untuk di evaluasi
     * @param rowIndex index dari data dalam table
     */
    customRowCssStyleGenerator ?: ( gridType: 'scrollable' |'default' ,  data: DATA , rowIndex: number ) => React.CSSProperties ; 
    
}

export interface BaseGridState<DATA> extends BaseHtmlComponentState {
    /**
     * column definitions
     */
    columnDefinitions: GridColumnProps<DATA>[] ;
}

/**
 * base class untuk grid dengan table
 * 
 */
export abstract class BaseGrid<DATA , PROPS extends BaseGridProps<DATA> , STATE  extends BaseGridState<DATA>>  extends BaseHtmlComponent<PROPS, STATE > {

    /**
     * css default untuk textbox
     */
    static DEFAULT_CSS_SEARCH_TXTBOX: string = 'form-control' ; 

    /**
     * css combo box 
     */
    static DEFAULT_CSS_SEARCH_COMBOBOX: string = '' ; 
    /**
     * buttons
     */
    actionButtons: GridButtonProps<DATA> []; 

    /**
     * status dari button. ini kalau misal ada perubahan , untuk memaksa reload
     */
    buttonEnabledFlagArray: Array<boolean>  ; 

    render (): JSX.Element {
        let rows: any[]  = this.populateRows(); 
        let headerCol: JSX.Element[] = [] ; 
        let i: number = 1 ; 
        for ( let c of this.state.columnDefinitions) {
            if ( !isNull(c.onlyRenderedFlag) && c.onlyRenderedFlag === ColumnRenderFlag.scrollableOnly) {
                continue;
            }
            if ( !isNull(c.customGridHeaderFormatter)) {
                headerCol.push( c.customGridHeaderFormatter!());
            } else {
                headerCol.push(<th style={{width : c.width}} key={'header_col_' + i} className={c.gridHeaderCssname}>{c.label}</th>);
            }
            i++ ; 
        }
        return (
        <table 
            className={this.props.cssName} 
            id={this.props.tableId}
        >
            <thead key='head'>
                <tr style={{display: 'none'}}><td>{this.props.children}</td></tr>
                <tr className={this.props.theadCssName} key='header_row'>
                    {headerCol}
                </tr>
            </thead>
            <tbody key='body'>
                {rows}
            </tbody>
            {this.rendererTaskFooter()}
                    
        </table>    
        );
    }
    /**
     * menandai state dari grid berganti. agar komponen dari grid ter reload
     */
    updateGridState () {
        this.setStateHelper(st => {
            //
        }) ; 
    }

    /**
     * populate row gridd
     */
    populateRows () {
        let rows: any[] = [];
        let pnl1: JSX.Element = this.generateFirstRowPanel();
        if (!isNull(pnl1)) {
            rows.push(pnl1);
        }
        let idx: number = 1 ; 
        let datas: DATA[] = this.getGridData();
        if (! isNull(datas)) {
            for ( let d of datas) {
                rows.push(this.rendererTaskRowGenerator(idx, d));
                
                idx++;
            }
        }
        return rows ; 
    }

    /**
     * generate sub panel row. di bawah data. ini format table bebas
     * @param data grid data
     * @param rowIndex index dari data
     */
    abstract populateSubRow (data: DATA , rowIndex: number ): JSX.Element[]  ;

    /**
     * check jqgrid allowed atau tidak
     */
    isScrollableGridAllowed (): boolean   {
        console.log('[BaseGrid#isScrollableGridAllowed] memulai pengecekan scrollable allowed flag');
        let wnd: any = window ; 
        if ( isNull(wnd.MobileDetect)) {
            console.error('[System] mobile detect tidak terinstall, silakan cek pada tag script anda, dokumentasi bisa di cek di sini : https://hgoebl.github.io/mobile-detect.js/' );
            return false ; 
        }
        var md = new wnd.MobileDetect(window.navigator.userAgent);
        let mblChk: any = md.mobile(); 
        console.log('[BaseGrid#isScrollableGridAllowed] mblChk' , mblChk);
        if ( isNull(mblChk)) {
            return true ; 
        } else {
            let chkTab: any = md.tablet(); 
            if ( !isNull(chkTab)) {
                return true ; 
            }
        }
        return false ; 
    }
    /**
     * panel untuk row ke 1. ini misal untuk search panel
     */
    generateFirstRowPanel(): JSX.Element {
        return null!;
    }
    /**
     * membaca data grid
     */
    abstract getGridData (): DATA[] ;  
    /**
     * meminta lookup container yang di pakai grid
     */
    abstract getLookupContainer (): {[id: string]: CommonCommunicationData.CommonLookupValue[]} ; 
    /**
     * state dari grid
     * @param rowIndex 
     */
    abstract getGridRowState ( rowIndex: number ) ;

    /**
     * checker action buttons. enabled flag 
     */
    readButtonEnableFlag (): Array<boolean> {
        if ( isNull(this.actionButtons) || this.actionButtons.length === 0 ) {
            return [] ; 
        }
        let rslt: Array<boolean> =  this.actionButtons.map( st => { return this.readButtonEnableFlagAtomic(st); });
        return rslt ; 
    }
    
    /**
     * update data state. agar grid terupdate
     */
    updateState: () => any = () =>  {
        this.setStateHelper(st => {
            //
        });
    }
    /**
     * worker untuk render footer 
     */
    rendererTaskFooter (): JSX.Element {
        return  <tfoot style={{display : 'none'}}/>;
    }
    /**
     * renderer Row 
     */
    rendererTaskRowGenerator ( rowIndex: number ,  d: DATA  , rowClickHandler ?: ( data: DATA  , rowIndex: number ) => any  , lookup ?:  {[id: string]: { [id: string]:  CommonCommunicationData.CommonLookupValue}} ): JSX.Element {
        let odd: boolean = rowIndex % 2 === 0 ;
        let cols: any[] = [] ;  
        let idx: number = 1;
        
        for ( let c of this.state.columnDefinitions) {
            let sData: any = d ; 
            let cDef: any = c; 
            // let styleCol: any = {}; 
            if ( !isNull(c.onlyRenderedFlag) && c.onlyRenderedFlag === ColumnRenderFlag.scrollableOnly) {
                continue;
            }
            let colUnitWIdth: any = this.props.columnWidthUnit ; 
            let prpGrid: GridColumnRendererProps<DATA> = {
              rowNumber  : rowIndex , 
              columnDefinition: cDef ,
              columnWidthUnit: colUnitWIdth,
              data : sData,
              updateGridStateCommand: this.updateState,
              requestRowStateCommand: ( rowIndexWrapped: number ) => {
                  return this.getGridRowState(rowIndexWrapped);
              },
              lookupContainer: this.getLookupContainer!()  ,
              gridDataJoinedLookups: lookup!

            };
            
            cols.push((
            <GridColumnRenderer
                key={'automatic_row' + rowIndex + '_column_' + idx}
                {...prpGrid}
            />));
            idx++; 
        }
        let cssName: string = '' ; 
        if (this.props.rowCssNameProvider) {
            // let s: any = odd ; 
            cssName = this.props!.rowCssNameProvider!(odd);
        }
        let styleRow: React.CSSProperties = {} ; 
        if ( !isNull(this.props.customRowCssStyleGenerator)) {
            styleRow = this.props!.customRowCssStyleGenerator!('default' , d , rowIndex );
        }
        if ( isNull(rowClickHandler)) {
            return (
            <tr 
                className={cssName}
                key={'otomatic_row_' + rowIndex}
                style={styleRow}
            >
                {cols}
            </tr>
            );
        } else {
            return (
            <tr 
                className={cssName}
                onClick={() => {
                    if ( rowClickHandler) {
                        rowClickHandler(d , rowIndex);
                    }
                    
                }}
                key={'otomatic_row_' + rowIndex}
                style={styleRow}
            >
                {cols}
            </tr>);
        }
        
    }
    /**
     * checker per button
     * @param buton button untuk di proses
     */
    private readButtonEnableFlagAtomic (buton: GridButtonProps<DATA> ) {
        if ( !isNull(buton.doNotRenderIfCustomEvaluator)) {
            let chkDoNotnderIfFunc: boolean = buton.doNotRenderIfCustomEvaluator!(null!); 
            return !chkDoNotnderIfFunc ; 
        } else if ( !isNull(buton.doNotRenderIf)) {
            return !buton.doNotRenderIf ; 
        } else if ( !isNull(buton.hidden)) {
            return !buton.hidden;
        }   
        return true ; 
    }
} 
