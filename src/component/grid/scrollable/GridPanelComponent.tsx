import * as React from 'react';
import { isNull , i18n  } from '../../../utils/index';
import { CommonCommunicationData } from 'core-client-commons';
import { GridDataAlign , ColumnRenderFlag } from '../SimpleGridMetadata';

import {
    GridHeaderSearchDefinition, GridColumnLookupParameter, GridButtonClickEvent,
    GridColumnCustomTextFormatterParameter, GridColumnCustomFormatterParameter, DateValueFormatter, NumberAsCurrencyFormatterDefinition , 
    GridColumnDbProps, GridColumnProps, GridButtonProps

} from '../SimpleGridMetadata';

/**
 * parameter untuk normal grid row render. tipe simple
 */
export interface JqRenderSimpleRowParameter<DATA> {
    /**
     * index dari row data
     */
    rowIndex: number ;   
    /**
     * data untuk di render
     */
    data: DATA  ;  
}
/**
 * renderer 1 tr + child dari row jqgrid sederhana
 */
export interface JqRenderSimpleRowMethod <DATA> {
    (param: JqRenderSimpleRowParameter<DATA>): JSX.Element ;  
}
/**
 * parameter manual render
 */
export interface JqGridManualRowRendererParameter<DATA> {
    /**
     * data untuk di render dalam row
     */
    data: DATA []   ;  
    /**
     * data yang selected dalam grid
     */
    selectedData: DATA ; 
    /**
     * column definition
     */
    columnDefinitions: JqGridColumnProps<DATA>[] ; 

    /**
     * renderer row normal dengan grid def,memakai built in grid
     */
    simpleGridRenderer: JqRenderSimpleRowMethod<DATA>;
    /**
     * row click handler
     */
    rowClickHandler ?: ( data: DATA  , rowIndex: number ) => any  ;
    /**
     * lookup container
     */
    lookupContainers ?:  {[id: string]:    CommonCommunicationData.CommonLookupValue[] }  ; 
    /**
     * method untuk meminta grid update state
     */
    updateGridStateCommand: () => any ; 
    /**
     * generator custom style untuk row. untuk manipulasi style row dengan kondisi 
     */
    customRowCssStyleGenerator ?: ( data: DATA , rowIndex: number ) => React.CSSProperties ;
    
}

/**
 * ini di pergunakan kalau grid perlu di render dengan 1 data 1 tbody. dalam kasus data dalam grid terdiri atas beberapa row. 
 */
export interface JqGridManualRowRenderer<DATA> {

    /**
     * worker untuk render 1 row. ini mandatory menyertakan tbody dalam 1 kelompok. kalau misal semua data 1 tbody, anda mandatory menyertakan tbody sebagai root
     */
    ( param: JqGridManualRowRendererParameter<DATA> ):  JSX.Element[] ; 
}

/**
 * definisi untuk grid button
 */
export interface JqGridButtonProps<DATA> {
   
    /**
     * title untuk button. hint
     */
    buttonTitle: string;
    /**
     * label dari button, pada umumnya ini tidak di isi /kosong
     */
    label?: string;
    /**
     * kalau ini true , maka akan di render as column
     */
    renderButtonOnColumnFlag?: boolean;
    /**
     * css tambahan untuk button. ini kalau di taruh dalam column, ini akan di pakai
     */
    buttonCss?: string;
    /**
     * css untuk mouse enter. untuk ubah-ubah icon pada saat hover
     */
    buttonCssOnMouseEnter  ?: string ; 
    /**
     * ini tombol hanya di tampilkan pada saat item selected atau tidak
     */
    showOnlyOnItemSelected: boolean;
    /**
     * handler click pada tombil
     */
    clickHandler: (data: DATA , rowIndex: number ) => any;
    /**
     * click handler dengan full blown. termasuk state dari row
     */
    clickHandlerExtended  ?: (event: GridButtonClickEvent<DATA> ) => any ; 
    /**
     * ini akan di inject oleh grid. method untuk show hide tombol
     */
    showButton?: (show: boolean) => any;
    /**
     * evaluator show button on create
     */
    showButtonOnCreateEvaluator?: () => boolean;
    /**
     * evaluator , apakah button bisa tampil atau tidak.
     * masukan di sini kalau misal tombol tampilnya berdasarkan kondisi tertentu.<br/>
     * Contoh kondisi misal nya: <br/>
     * <ol>
     * <li>tampilk kalau data 1 cabang</li>
     * <li>tampil kalau misal user punya privilage delete</li>
     * <li>etc</li>
     * </ol>
     */
    showButtonOnRowSelectedEvaluator?: (selectedRowId: string) => boolean;
    /**
     * custom formatter dengan data + row index
     */
    doNotRenderIfCustomEvaluator  ?: (rowData: DATA    ) => any ;
    /**
     * switch untuk skip rendering. ini untuk conditional semacam angular. kalau ini bernilai true maka tombol tidak akan di render
     */
    doNotRenderIf ?: boolean; 
    /**
     * flag element displayed atau tidak
     */
    hidden  ?: boolean ; 
    /**
     * color untuk button di hover, default : red
     */
    buttonHoveredColor  ?: any ; 
    /**
     * prop asal dari button. di kirim dari simple grid misalnya
     */
    originalButtonProps  ?: GridButtonProps<DATA> ; 
    
}
/**
 * props untuk column
 */
export interface JqGridColumnProps<DATA> {
    /**
     * title untuk column header. agar tidak terlewat. di tempat kan berasama definition
     */
    columnTitle: string;
    /**
     * nama field. ini nama js field yang akan di ambil
     */
    fieldName: string;
    
    /**
     * definisi search untuk header column. 
     */
    searchDefinition?: GridHeaderSearchDefinition; 

    /**
     * id lookup. kalau ada bind ke lookup unutk grid
     */
    lookupParameter  ?: GridColumnLookupParameter<DATA>;

    /**
     * flag sortable. default : false
     */
    sortable?: boolean;
    /**
     * default sorting
     */
    defaultSort?: 'asc' | 'desc' ;

    /**
     * center , left, atau right <br/>
     * rata ke mana data
     */
    align?: GridDataAlign;

    /**
     * lebar column
     */
    width: number;

    /**
     * custom data renderer
     */
    customFormatter?: ( param: GridColumnCustomFormatterParameter<DATA> ) => JSX.Element;
    /**
     * formatter dt
     */
    textFormatter  ?: (param: GridColumnCustomTextFormatterParameter<DATA>) => string ; 
    /**
     * hidden column atau tidak. ini kalau di perlukan column hidden
     */
    hiddenColumn?: boolean;
    /**
     * provider title untuk column dalam grid
     */
    gridRowTitleGenerator?: (DATA: DATA) => string ;
    /**
     * penyedia css column kalau memerlukan custom css untuk column
     */
    cssProviderDataColumn?: (data: DATA, rowIndex: number) => string;
    /**
     * built in react
     */
    key?: string;
    /**
     * formatter date. kalau di isikan , ini akan di format dengan pattern yang di berikan dalam value
     */
    dateValueFormatter?: DateValueFormatter; 
    /**
     * formatter number
     */
    numberAsCurrencyFormatter?: NumberAsCurrencyFormatterDefinition; 
}
/**
 * wrapper data button + grid dalam 1 data
 */
export interface PredefinedColumnAndButtonParameter<DATA> {
    /**
     * grid buttons.baik itu button di bawah grid, atau pun button dalam row grid
     */
    gridButtons: JqGridButtonProps<DATA>[];

    /**
     * column defs
     */
    columnDefinitions: JqGridColumnProps<DATA>[];
}

/**
 * extract column + buttons dari child grid
 * @param props 
 */
export function __jqExtractColumnAndButton <DATA> ( props: any [] , gridType: 'simple' |'scrollable'): PredefinedColumnAndButtonParameter<DATA> {
    let btns: any [] =  []; 
    let cols: any [] = [] ; 
    for ( let chld of props  ) {
        let act: any = chld ; 
        
        __jqExtractColumn(cols , act , gridType ) ; 
        __jqExtractButton( btns , act); 
    }
    return {
        columnDefinitions  : cols , 
        gridButtons: btns 
    };
}
/**
 * untuk generate JqGridColumnProps dari children. ini untuk scanner children dari jqgrid/simple grid
 * @param props  props utnuk di periksa komponen column
 * @param containers tempat menampung definisi column
 */
export function __jqExtractColumn<DATA> ( containers: Array< JqGridColumnProps<DATA>> ,   props: any  /*GridColumnDbProps<DATA> |GridColumnProps<DATA>*/ , gridType: 'simple' |'scrollable' ): any {
    if ( isNull(props)) {
        return ; 
    }
    
    if ( Array.isArray(props)) {
        let r: any [] = props ; 
        if ( r.length === 0 ) {
            return ; 
        }
        for ( let c of r) {
            __jqExtractColumn(containers , c , gridType)  ;
        }
    }
    if ( !isNull(props.props)) {
        props = props.props ; 
    }
    if ( ! (    (!isNull(props.fieldName)  &&   props.fieldName.length > 0)  || !isNull( props.customDataFormatter) || !isNull(props.customValueFormatter) ) ) {
        return ; 
    }
    if ( !isNull(props.onlyRenderedFlag)) {
        let rndrOnlyFlag: ColumnRenderFlag = props.onlyRenderedFlag ; 
        if ( gridType === 'simple') {// ini simple grid, tp flag render cuma untuk scrollable 
            if ( rndrOnlyFlag !== ColumnRenderFlag.both && rndrOnlyFlag !== ColumnRenderFlag.simpleGridOnly) {
                return ; 
            }
        } else {
            if ( rndrOnlyFlag !== ColumnRenderFlag.both && rndrOnlyFlag !== ColumnRenderFlag.scrollableOnly) {
                return ; 
            }
        }
    }
    if ( !isNull(props.defaultLabel)    ) {
        let dbProp: GridColumnDbProps<DATA> = props ; 
        let colDef: JqGridColumnProps<DATA>  = {
            columnTitle : i18n(dbProp.i18nKey! , dbProp.defaultLabel) , 
            fieldName : dbProp.fieldName , 
            width : !isNull( dbProp.width)  ?  dbProp.width! : 100  , // !isNull(dbProp.scrollableColumnParam) && !isNull(dbProp.scrollableColumnParam.width)?  dbProp.scrollableColumnParam.width : ( !isNull( dbProp.width)  ?  dbProp.width : 100 ), 
            align : dbProp.align  , 
            hiddenColumn : dbProp.hidden  , 
            customFormatter: dbProp.customDataFormatter , 
            textFormatter: dbProp.customValueFormatter ,
            dateValueFormatter: dbProp.dateValueFormatter , 
            defaultSort : dbProp.defaultSort , 
            sortable : dbProp.sortable  , 
            lookupParameter: dbProp.lookupParameter , 
            numberAsCurrencyFormatter: dbProp.numberAsCurrencyFormatter  , 
            searchDefinition : dbProp.searchDefinition , 
        };
        if ( !isNull(dbProp.scrollableColumnParam)) {
            if (!isNull(dbProp!.scrollableColumnParam!.width)) {
                colDef.width = dbProp!.scrollableColumnParam!.width! ; 
            }
            colDef.gridRowTitleGenerator = dbProp!.scrollableColumnParam!.gridRowTitleGenerator ; 
        }
        containers.push(colDef);

    } else {
        let colSimple: GridColumnProps<DATA> = props ; 
        let smplColDef: JqGridColumnProps<DATA>  = {
            columnTitle: colSimple.label , 
            fieldName: colSimple.fieldName , 
            width: !isNull( colSimple.width)  ?  colSimple.width! : 100 , 
            align: colSimple.align , 
            cssProviderDataColumn : null!  , 
            customFormatter: colSimple.customDataFormatter , 
            dateValueFormatter: colSimple.dateValueFormatter , 
            defaultSort : null! , 
            sortable : false , 
            gridRowTitleGenerator: null !, 
            hiddenColumn : colSimple.hidden , 
            lookupParameter: colSimple.lookupParameter , 
            numberAsCurrencyFormatter: colSimple.numberAsCurrencyFormatter , 
            searchDefinition : null! , 
            textFormatter: colSimple.customValueFormatter 
        };
        if ( !isNull(colSimple.scrollableColumnParam)) {
            if (!isNull(colSimple!.scrollableColumnParam!.width)) {
                smplColDef.width = colSimple.scrollableColumnParam!.width! ; 
            }
            smplColDef.gridRowTitleGenerator = colSimple!.scrollableColumnParam!.gridRowTitleGenerator ; 
        }
        containers.push(smplColDef);
    }
    
}

/**
 * extract child dengan tipe button dari children grid. 
 * @param containers penampung button. ini untuk di taruh dalam state
 * @param props props untuk di extract button nya
 */
export function __jqExtractButton<DATA> ( containers: Array< JqGridButtonProps<DATA>> ,   props: any   ): any {
    if ( isNull(props)) {
        return ; 
    }
    if ( Array.isArray(props)) {
        let r: any [] = props ; 
        if ( r.length === 0 ) {
            return ; 
        }
        for ( let c of r) {
            __jqExtractButton(containers , c)  ;
        }
    }
    if ( !isNull(props.props)) {
        props = props.props ; 
    }
    if ( isNull(props.clickHandler)) {
        return ; 
    }
    let swapOriginalButtonProps: GridButtonProps<DATA> = props ; 
    
    let jqBtnProp: JqGridButtonProps<DATA> = {
        clickHandler: swapOriginalButtonProps.clickHandler , 
        label : '' , 
        buttonTitle : swapOriginalButtonProps.label ,
        buttonCss: swapOriginalButtonProps.iconCssClass , 
        buttonCssOnMouseEnter: swapOriginalButtonProps.iconCssMouseEnter , 
        buttonHoveredColor: null  , 
        clickHandlerExtended : swapOriginalButtonProps.clickHandlerExtended , 
        doNotRenderIf : swapOriginalButtonProps.doNotRenderIf , 
        renderButtonOnColumnFlag : true , 
        doNotRenderIfCustomEvaluator: swapOriginalButtonProps.doNotRenderIfCustomEvaluator ,
        
        hidden   : swapOriginalButtonProps.hidden , 
        showOnlyOnItemSelected : false , 
        originalButtonProps: swapOriginalButtonProps
    };
    if ( !isNull( swapOriginalButtonProps.scrollableButtonParam )) {
        if ( !isNull(swapOriginalButtonProps!.scrollableButtonParam!.buttonCss )) {
            jqBtnProp.buttonCss =  swapOriginalButtonProps!.scrollableButtonParam!.buttonCss ;
        } 
        if ( !isNull(swapOriginalButtonProps!.scrollableButtonParam!.buttonCssOnMouseEnter )) {
            jqBtnProp.buttonCssOnMouseEnter = swapOriginalButtonProps.scrollableButtonParam!.buttonCssOnMouseEnter ; 
        }
        if ( !isNull(swapOriginalButtonProps!.scrollableButtonParam!.label )) {
            jqBtnProp.label = swapOriginalButtonProps!.scrollableButtonParam!.label ; 
        }
        if ( !isNull(swapOriginalButtonProps!.scrollableButtonParam!.title )) {
            jqBtnProp.buttonTitle = swapOriginalButtonProps!.scrollableButtonParam!.title! ; 
        }
        if ( !isNull(swapOriginalButtonProps!.scrollableButtonParam!.renderButtonOnColumnFlag )) {
            jqBtnProp.renderButtonOnColumnFlag = swapOriginalButtonProps!.scrollableButtonParam!.renderButtonOnColumnFlag ;
        } 
        if ( !isNull(swapOriginalButtonProps!.scrollableButtonParam!.showButtonOnRowSelectedEvaluator )) {
            jqBtnProp.showButtonOnRowSelectedEvaluator = swapOriginalButtonProps.scrollableButtonParam!.showButtonOnRowSelectedEvaluator ; 
        }
        if ( !isNull(swapOriginalButtonProps!.scrollableButtonParam!.showOnlyOnItemSelected )) {
            jqBtnProp.showOnlyOnItemSelected = swapOriginalButtonProps!.scrollableButtonParam!.showOnlyOnItemSelected ; 
        }
    }
    containers.push(jqBtnProp);
}