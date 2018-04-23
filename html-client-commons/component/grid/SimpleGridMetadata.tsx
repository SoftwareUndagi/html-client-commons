
import * as React from "react";
import { CommonCommunicationData , isNull, ListOfValueManager } from 'core-client-commons/index';
import { FormatterUtils } from '../../utils/index';
import {  } from 'core-client-commons/index';
import { SimpleQueryOperator } from '../search-form/CommonSearchForm';
import { BaseHtmlComponent } from "../BaseHtmlComponent";
import { GridSearchData } from './grid-search-data';

/**
 * parameter untuk generate data after row, dalam kasus simple grid
 */
export interface SimpleGridAfterRowDataPanelGeneratorParameter<DATA> {
    /**
     * data acuan
     */
    data: DATA;
    /**
     * index data
     */
    rowIndex: number;
    /**
     * column def
     */
    columnDefinitions: GridColumnProps<DATA>[];
    /**
     * state container
     */
    rowStateContainer: { [id: string]: any };

    /**
     * command untuk update grid state
     */
    updateGrid: () => any;

}
/**
 * param untuk render custom column
 */
export interface GridColumnCustomFormatterParameter<DATA> {
    /**
     * data untuk row
     */
    data: DATA;
    /**
     * index dari data
     */
    rowIndex: number;
    /**
     * flag data selected atau tidak
     */
    selectedData: boolean;

    /**
     * lookup container
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };

    /**
     * state dari row
     */
    rowState?: any;
    /**
     * method untuk memaksa grid update state
     */
    updateGridStateCommand: () => any;

    /**
     * tipe dari grid yang request. normal atau scrollable grid
     */
    gridType: 'standard' | 'scrollable';
}

/**
 * interface untuk method formatter dengan return string 
 */
export interface GridColumnCustomTextFormatterMethod<DATA> {

    /**
     * @param param parameter dari grid
     */
    (param: GridColumnCustomTextFormatterParameter<DATA>): string;
}
/**
 * param untuk render custom column
 */
export interface GridColumnCustomTextFormatterParameter<DATA> {
    /**
     * label asli untuk data
     */
    originalLabel: any;
    /**
     * data grid
     */
    rawData: DATA;
    /**
     * index dari data dalam row
     */
    rowIndex: number;
    /**
     * flag selected
     */
    selectedData: boolean;
    /**
     * lookup container
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
    /**
     * state dari row
     */
    rowState?: any;
}
/**
 * definisi lookup untuk grid column
 */
export interface GridColumnLookupParameter<DATA> {
    /**
     * id dari lookup
     */
    lookupId: string;
    /**
     * nama lookup field. ini untuk membaca hasil query untuk di match ke lookup. default sama dengan fieldName
     */
    lookupFieldName?: string;
    /**
     * formatter value dedidcated untuk render value. default akan return code - label
     */
    customValueFormatter?: (data: DATA, lookups: { [id: string]: CommonCommunicationData.CommonLookupValue }) => string;
    /**
     * formatter panel langsung untuk lookup. ini return sekalian bersama dengan td dari table
     */
    customColumnFormatter?: (data: DATA, lookups: { [id: string]: CommonCommunicationData.CommonLookupValue }) => JSX.Element;
}
/**
 * align untuk text
 */
export enum GridDataAlign {
    left,
    right,
    center
}

/**
 * Definisi grid button
 */
export interface GridButtonProps<DATA> {

    /**
     * css untuk icon button
     */
    iconCssClass: string;

    /**
     * ini untuk menghide beberapa column. kalau simple grid(basis table, lebar grid terbatas). beberapa column perlu untuk tidak di render
     */
    onlyRenderedFlag?: ColumnRenderFlag;

    /**
     * provider data css. ini kalau perlu if atau semacam nya untuk button css
     */
    iconCssClassProvider?: (rowData: DATA) => string;

    /**
     * css untuk icon class. mouse enter
     */
    iconCssMouseEnter?: string;
    /**
     * label/hint untuk drop down 
     */
    label: string;

    /**
     * handler untuk icon di click
     */
    clickHandler: (rowData: DATA) => any;

    /**
     * click handler dengan full blown. termasuk state dari row
     */
    clickHandlerExtended?: (event: GridButtonClickEvent<DATA>) => any;

    /**
     * default sorting
     */
    defaultSort?: 'asc' | 'desc';
    /**
     * ini untuk memaksa data untuk tidak di render , kalau flag = true . ini di rencanakan untuk di pergunakan sesuai dengan privilage
     */
    doNotRenderIf?: boolean;

    /**
     * flag element displayed atau tidak
     */
    hidden?: boolean;

    /**
     * custom formatter dengan data + row index
     */
    doNotRenderIfCustomEvaluator?: (rowData: DATA) => any;

    /**
     * parameter untuk scrollable grid
     */
    scrollableButtonParam?: {
        /**
         * title dari button. untuk bagian hover
         */
        title?: string;
        /**
         * untuk bagian label dari button
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
         * css pada saat mouse enter button
         */
        buttonCssOnMouseEnter?: string;
        /**
         * ini tombol hanya di tampilkan pada saat item selected atau tidak
         */
        showOnlyOnItemSelected: boolean;

        /**
         * evaluator , apakah button bisa tampil atau tidak.
         * masukan di sini kalau misal tombol tampilnya berdasarkan kondisi tertentu.<br/>
         * Contoh kondisi misal nya : <br/>
         * <ol>
         * <li>tampilk kalau data 1 cabang</li>
         * <li>tampil kalau misal user punya privilage delete</li>
         * <li>etc</li>
         * </ol>
         */
        showButtonOnRowSelectedEvaluator?: (selectedRowId: string) => boolean;

    };

}
/**
 * untuk flag kapan column di render. dalam kasus grid bisa switch dari scrollable vs non scrollable
 */
export enum ColumnRenderFlag {
    both,
    scrollableOnly,
    simpleGridOnly
}
/**
 * parameter spesifik untuk grid scrollable
 */
export interface ScrollableGridParameter {

}

/**
 * param untuk column 
 */
export interface ScrollableColumnParameter<DATA> {
    /**
     * lebar dari column, ini dalam PX. kalau grid dalam format jqgrid
     */
    width?: number;

    /**
     * provider title untuk column dalam grid
     */
    gridRowTitleGenerator?: (DATA: DATA) => string ;

}

/**
 * formatter untuk tgl dan bulan
 */
export interface DateValueFormatter {
    /**
     * pattern untuk format date. ini mutlak di sertakan
     */
    datePattern: "dd/mm/yyyy" | "mm/dd/yyyy" | "dd/mm/yy" | "mm/dd/yy" | "dd-mm-yyyy" | "mm-dd-yyyy" | "dd-mm-yy" | "mm-dd-yy" | "yyyy-mm-dd";

    /**
     * kalau di masukan, maka data akan di format dengan jam
     */
    timePattern?: 'hh:MM' | 'hh:MM:ss';
}
/**
 * definisi simple column
 */
export interface GridColumnProps<DATA> {

    /**
     * ini untuk menandai kalau element ini tidak perlu di render. semacam if pada angular. kalau ini = true - column tidak akan di render
     */
    doNotRenderIf?: boolean;
    /**
     * definisi search untuk header column. 
     */
    searchDefinition?: GridHeaderSearchDefinition;
    /**
     * label dari grid. untuk title
     */
    label: string;
    /**
     * id lookup. kalau ada bind ke lookup unutk grid
     */
    lookupParameter?: GridColumnLookupParameter<DATA>;
    /**
     * css untuk row. fungsi dengan asumsi bisa zebra 
     */
    rowCssNameProvider?: (isOdd: boolean) => string;
    /**
     * generator style untuk column. untuk formatting dengan style (bukan css name)
     * use case sederhana : generate indent dalam data dengan tipe tree
     */
    customColumnStyleProvider?: (rawData: DATA, rowIndex: number) => any;

    /**
     * css untuk header title
     */
    gridHeaderCssname: string;

    /**
     * nama field untuk di akses grid column
     */
    fieldName: string;
    /**
     * akan di default : left
     */
    align?: GridDataAlign;

    /**
     * ini untuk menghide beberapa column. kalau simple grid(basis table, lebar grid terbatas). beberapa column perlu untuk tidak di render
     */
    onlyRenderedFlag?: ColumnRenderFlag ; 

    /**
     * lebar dari column
     */
    width?: number;
    /**
     * flag element displayed atau tidak
     */
    hidden?: boolean;

    /**
     * parameter untuk scrollable grid(semacam jqgrid )
     */
    scrollableColumnParam?: ScrollableColumnParameter<DATA>;

    /**
     * formatter kalau di perlukan. ini kalau anda mau merender as widget 
     */
    customDataFormatter?: (parameter: GridColumnCustomFormatterParameter<DATA>) => JSX.Element;
    /**
     * kalau hanya sebatas nilai saja yang di format
     */
    customValueFormatter?: GridColumnCustomTextFormatterMethod<DATA>;   // (parameter :  GridColumnCustomTextFormatterParameter<DATA>) => string ; 

    /**
     * kalau grid column memerlukan custom formatter
     */
    customGridHeaderFormatter?: () => JSX.Element;

    /**
     * formatter number
     */
    numberAsCurrencyFormatter?: NumberAsCurrencyFormatterDefinition;

    /**
     * formatter date. kalau ini di isi berarti data di asumsikan date
     */
    dateValueFormatter?: DateValueFormatter;
}
/**
 * definisi simple column
 */
export interface GridColumnDbDrivenProps<DATA> extends GridColumnProps<DATA> {

    /**
     * sortable atau tidak. kalau true maka data akan bisa di sort 
     */
    sortable?: boolean;
}

/**
 * tipe search filter
 */
export enum GridHeaderSearchType {

    TEXTBOX,
    EMAIL_TEXTBOX,
    NUMBER_TEXTBOX,
    DATE_PICKER,
    DATE_FROM_TO,
    SELECT2,
    SELECTFX,
    SIMPLE_COMBOBOX,
    SIMPLE_COMBOBOX_MULTIPLE,
    /**
     * multiple selection item(semacam select2)
     */
    MULTIPLE_SELECTION,
    /**
     * custom user defined search
     */
    CUSTOM

}

/**
 * method untuk generate search parameter
 */
export interface CustomSearchPanelGenerator {

    /**
     * return = element jsx
     * @param param parameter searching
     * 
     */
    (param: CustomSearchPanelGeneratorParameter): any;
}

/**
 * parmaeter untuk generate custom search panel
 */
export interface CustomSearchPanelGeneratorParameter {

    /**
     * lookup manager untuk request lookup
     */
    lookupManager: ListOfValueManager;

    /**
     * worker untuk assign query.query berada pada header
     */
    assignQueryHandler: (field: string, whereValue: any) => any;

    /**
     * assign query.query ada pada model
     */
    assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any;
    /**
     * container data lookup
     */
    lookupContainer: { [id: string]: CommonCommunicationData.CommonLookupValue[] };

}

/**
 * untuk definisi include model versi nested
 */
export interface GridHeaderSearchIncludeModelNestedDefinition {

    /**
     * nama model pada level ini
     */
    modelName: string;

    /**
     * default false. query dengan inner join atau bukan
     */
    innerJoinQuery?: boolean;

    /**
     * kalau ada alias untuk include model
     */
    asName?: string;

    /**
     * child def dari include model dalam search versi nested
     */
    child?: GridHeaderSearchIncludeModelNestedDefinition;
}

/**
 * wrapper parameter untuk search dengan join 
 */
export interface AssignQueryOnJoinHandlerParameter {

    /**
     * nama field yang di query, ini nama js dari field yang di query 
     */
    queryField: string ; 
    
    /**
     * value untuk query 
     */
    value: any ; 
    /**
     * definisi search on join
     */
    searchOnJoinDefinition: SearchOnJoinDefinition ; 
}

/**
 * definisi search pada join
 */
export interface SearchOnJoinDefinition {
    /**
     * nama model untuk include search
     */
    modelName: string;
    /**
     * use inner join atau bukan. ini kalau include = true 
     */
    useInnerJoin?: boolean;
    /**
     * alias dari join(as dalam sequelize)
     */
    includeAs?: string;
    /**
     * kalau query di include dengan model nested join
     */
    nestedJoinDefinition?: GridHeaderSearchIncludeModelNestedDefinition;
}
/**
 * definisi search pada header
 */
export interface GridHeaderSearchDefinition {

    /**
     * field untuk di search 
     */
    queryField: string;
    /**
     * operator query 
     */
    queryOperator?: SimpleQueryOperator;
    /**
     * search type
     */
    searchType: GridHeaderSearchType;

    /**
     * kalau di perlukan custom panel generator untuk search. bisa mempergunakan method ini untuk render panel search
     */
    customSearchPanelGenerator?: CustomSearchPanelGenerator; // (param : CustomSearchPanelGeneratorParameter)=> JSX.Element  ; 

    /**
     * kalau search ada lookup
     */
    lookupId?: string;

    /**
     * ini kalau search pada join
     */
    searchOnJoinDefinition?: SearchOnJoinDefinition ; 

    /**
     * flag kapan panel tidak perlu di render. misal search tidak di perlukan
     */
    doNotRenderIf?: boolean;

    /**
     * id  untuk container select 2 
     */
    select2ContainerId?: string;

    /**
     * additional search metadata
     */
    additonalControlMetadata?: GridSearchData.TextboxSearchMetadata | GridSearchData.DatePickerSearchMetadata | GridSearchData.Select2SearchMetadata | GridSearchData.DateFromToMetadata | GridSearchData.MultipleSelectionMetadata;
}

/**
 * formatter number
 */
export interface NumberAsCurrencyFormatterDefinition {
    /**
     * apakah pemisah ribuan memakai koma. kalau format indonesia maka akan memakai titik untuk pemisah ribuan 
     */
    useDotTousandSeparator: boolean;
    /**
     * berapa angka yang di preserver setelah koma
     */
    remainedFraction: number;
}
/**
 * data untuk click grid action button
 */
export interface GridButtonClickEvent<DATA> {
    /**
     * data dari grid
     */
    data: DATA;
    /**
     * index dari row
     */
    rowIndex: number;

    /**
     * state dari row
     */
    rowState: { [id: string]: any };

    /**
     * method untuk update grid state
     */
    updateGridState: () => any;
}
/**
 * poperty db driven column
 */
export interface GridColumnDbProps<DATA> {
    /**
     * definisi search untuk header column. 
     */
    searchDefinition?: GridHeaderSearchDefinition;
    /**
     * ini untuk menandai kalau element ini tidak perlu di render. semacam if pada angular. kalau ini = true - column tidak akan di render
     */
    doNotRenderIf?: boolean;

    /**
     * ini untuk menghide beberapa column. kalau simple grid(basis table, lebar grid terbatas). beberapa column perlu untuk tidak di render
     */
    onlyRenderedFlag?: ColumnRenderFlag;

    /**
     * sortable atau tidak. kalau true maka data akan bisa di sort 
     */
    sortable?: boolean;
    /**
     * id lookup. kalau ada bind ke lookup unutk grid
     */
    lookupParameter?: GridColumnLookupParameter<DATA>;
    /**
     * default sorting
     */
    defaultSort?: 'asc' | 'desc';
    /**
     * label dari grid. untuk title
     */
    defaultLabel: string;

    /**
     * key untuk internalization. untuk translate bahasa
     */
    i18nKey?: string;
    /**
     * css untuk row. fungsi dengan asumsi bisa zebra 
     */
    rowCssNameProvider?: (isOdd: boolean) => string;
    /**
     * css untuk header title
     */
    gridHeaderCssname: string;
    /**
     * nama field untuk di akses grid column
     */
    fieldName: string;
    /**
     * akan di default : left
     */
    align?: GridDataAlign;

    /**
     * lebar dari grid
     */
    width?: number;
    /**
     * formatter kalau di perlukan. ini kalau anda mau merender as widget 
     */
    customDataFormatter?: (parameter: GridColumnCustomFormatterParameter<DATA>) => JSX.Element;
    /**
     * kalau grid column memerlukan custom formatter
     */
    customGridHeaderFormatter?: () => JSX.Element;
    /**
     * kalau hanya sebatas nilai saja yang di format
     */
    customValueFormatter?: (parameter: GridColumnCustomTextFormatterParameter<DATA>) => string;
    /**
     * generator style untuk column. untuk formatting dengan style (bukan css name)
     * use case sederhana : generate indent dalam data dengan tipe tree
     */
    customColumnStyleProvider?: (rawData: DATA, rowIndex: number) => any;
    /**
     * flag element displayed atau tidak
     */
    hidden?: boolean;
    /**
     * formatter number
     */
    numberAsCurrencyFormatter?: NumberAsCurrencyFormatterDefinition;
    /**
     * formatter date. kalau ini di isi berarti data di asumsikan date
     */
    dateValueFormatter?: DateValueFormatter;
    /**
     * parameter untuk scrollable grid(semacam jqgrid )
     */
    scrollableColumnParam?: ScrollableColumnParameter<DATA>;

}

/**
 * column untuk db column . pengganti definisi column dengan js. tidak intuitif
 */
export class GridColumnDb<DATA> extends BaseHtmlComponent<GridColumnDbProps<DATA>, any> {
    constructor(props: GridColumnDbProps<DATA>) {
        super(props);
    }

    render(): JSX.Element {
        return <input type='hidden' key={this.props.fieldName + '_' + this.props.defaultLabel} />;
    }
}
/**
 * simple grid column definition
 */
export class GridColumn<DATA> extends BaseHtmlComponent<GridColumnProps<DATA>, any> {
    render(): JSX.Element {
        return <input type='hidden' />;
    }
}

/**
 * definisi action buttons untuk grid. untuk tombol edit delete view pada bagian paling kanan dari grid
 */
export interface SimpleDbDrivenGridActionColumnProps<DATA> {

    /**
     * label untuk grid action
     */
    columnHeaderlabel: string;
    /**
     * definisi buttons
     */
    buttons: GridButtonProps<DATA>[];
}
/**
 * generator formater dengan tipe date. ini untuk scrollable apram dalam grid
 */
export function generateDateGridFormatter(datePattern: string): GridColumnCustomTextFormatterMethod<any> {

    // (originalLabel : any , rawData: any , rowIndex: number, selectedData: boolean , lookupContainers : {[id:string] :CommonCommunicationData.CommonLookupValue[]}) =>any  {
    return (param: GridColumnCustomTextFormatterParameter<any>) => {
        let originalLabel: any = param.originalLabel;
        if (isNull(originalLabel)) {
            return '';
        }
        let fmt: FormatterUtils = new FormatterUtils();
        return fmt.formatDate(originalLabel, datePattern);
    };
}
/**
 * generate number formatter untuk currency 
 */
export function generateMoneyGridFormatter(useDotasTousandSeparator: boolean, remainingFraction: number): GridColumnCustomTextFormatterMethod<any> {
    return (param: GridColumnCustomTextFormatterParameter<any>) => {
        let originalLabel: any = param.originalLabel;
        if (isNull(originalLabel)) {
            return '';
        }
        let fmt: FormatterUtils = new FormatterUtils();
        return fmt.formatMoney(originalLabel, useDotasTousandSeparator, remainingFraction);
    };
}

/**
 * parameter lookup grid. ini kalau grid mempergunakan lookup manager external
 */
export interface SimpleDbDrivenGridLookupProps {
    /**
     * Manager lookup value. kalau ini berisi , berarti lookup di handle oleh external. bukan oleh grid. kalau ini null, lookup manager akan menyediakan lookup manager
     */
    lookupManager: ListOfValueManager;
    /**
     * container lookup data. ini di bisa berasal dari editor atau main panel. silakan di sesuaikan
     */
    lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] };

}
/**
 * facade interface untuk grid. untuk penyeragaman jqgrid vs table driven grid
 */
export interface IDbDrivenGridPanel<DATA> {

    /**
     * assign query worker
     */
    assignQueryHandler: (field: string, whereValue: any) => any;
    /**
     * ini untuk mengeset kalau misal query di pergunakan dalam include model.
     */
    assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any;
    /**
     * lookup manager. untuk akses langsung ke lookup
     */
    lookupManager: ListOfValueManager;
    /**
     * menandai state dari grid berganti. agar komponen dari grid ter reload
     */
    updateState(): void;

    /**
     * membaca state untuk di ambil
     * @param rowIndex index dari row yang di ambil
     */
    getRowStateData(rowIndex: number): {
        [id: string]: any;
    };

    /**
     * membaca data grid
     */
    getGridData(): DATA[];

    /**
     * worker untuk submit query dan reload grid data
     */
    reloadGrid(): void;
    /**
     * navigate ke halaman yang di minta
     */
    navigate(page: number): void;
    /**
     * formater money
     * @param useDotThousandSeparator  separator thousand
     * @param remainFraction
     */
    generateSimpleCurrencyFormatter(useDotThousandSeparator: boolean, remainFraction: number): GridColumnCustomTextFormatterMethod<DATA>;
    /**
     * page sizes yang tersedia dalam data
     */
    getPageSizes(): number[];
    /**
     * page size yang di pilih
     */
    getSelectedPageSize(): number;
    /**
     * focus ke grid
     */
    focus();

}