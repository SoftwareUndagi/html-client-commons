import * as React from "react";
import { CommonCommunicationData , isNull }  from 'core-client-commons/index';
import { BaseGrid, BaseGridProps , BaseGridState } from './BaseGrid';
import { editorsupport } from '../editor/editorsupport';
import {  GridDataAlign, GridButtonProps, GridColumnProps  , ColumnRenderFlag , GridColumnCustomFormatterParameter , SimpleGridAfterRowDataPanelGeneratorParameter } from './SimpleGridMetadata';
import { GridActionColumn } from './GridActionColumn';
import { i18n } from '../../utils/FormatterUtils';
import { ObjectUtils } from '../../utils/ObjectUtils';
import { JqMemoryDrivenGridPanel  , JqGridManualRowRenderer } from './scrollable/index';
import { JqGridColumn ,  GridButton , JqGridButtonProps  } from './scrollable/GridPanel';
import { JqAfterDataRowGeneratorParameter } from './scrollable/JqBaseGridPanel';

export interface SimpleMemoryDrivenGridScrollableProps<DATA> {
    /**
     * ini kalau panel grid menyesuaikan dengan tinggi dari data
     */
    noVerticalScroll ?: boolean ; 

    /**
     * berlaku untuk scrollable grid. minumum height berapa. dalam kasus tidak ada data atau jumah data terlalu sedikit. default di isi 200
     */
    minimumHeight ?: number;
    /**
     * id dari lookup untuk di load
     */
    lookupIds ?: string []; 
    /**
     * manual grid renderer
     */
    manualGridRenderer ?: JqGridManualRowRenderer<DATA> ; 
    /**
     * title dari grid
     */
    gridTitle: string;
    
    /**
     * id untuk grid. ini sebaiknya unik
     */
    gridId: string ;
    /**
     * row number param. ini di masukan kalau grid memiliki row number column. pada sisi paling kiri
     */
    rowNumberParam?: {
        /**
         * label untuk header
         */
        headerLabel: string;

        /**
         * lebar nya berapa (px)
         */
        width: number;
    };
    /**
     * handler kalau row di click. kalau memerlukan task tertentu ( misal aktivasi button)
     */
    onRowSelectedHandler?: (data: DATA, rowIndex: number) => any ; 

    /**
     * tinggi grid
     */
    gridHeight ?: number ; 
    /**
     * space untuk di pakai di sisi kiri. pergunakan ini untuk space menu
     */
    spaceUsedOnLeftSide?: number;

    /**
     * space yang di sediakan sisi kanan dari grid
     */
    spaceUsedOnRightSide?: number;

    /**
     * lebar grid. untuk di set berapa minimum
     */
    gridMinimumWidth?: number;
    /**
     * kalau ini di set, grid akan diset dengan angka ini langsung. ini meng-asumsikan lebar grid di ketahui oleh parent
     */
    width ?: number ; 

    /**
     * lebar dari action column
     */
    actionColumnWidth ?: number ; 

    /**
     * key yang di pakai untuk menyimpan informasi grid ke state
     */
    saveStateKey ?: string ;

    /**
     * generator panel setelah data row. misal kalau memerlukan sub panel, di masukan di sini. ini untuk jqgrid. ini untuk jqgrid
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel ?:  ( param: JqAfterDataRowGeneratorParameter<DATA>) => JSX.Element[] ; 

}
export interface SimpleMemoryDrivenGridProps<DATA> extends BaseGridProps<DATA>   {

    /**
     * di action column kalau memerlukan custom control. misal : tombol add di pergunakan di sini 
     */
    actionColumnFirstRowCustomGenerator?: () => JSX.Element; 
    /**
     * lebar dari column 
     */
    actionColumnWidth: number; 
    /**
     * data container
     */
    dataContainer: editorsupport.ClientSideEditorContainer<DATA>; 
    /**
     * override untuk action column title. akan di default dengan i18nkey : control-common.grid.action-column
     */
    actionColumnTitle?: string; 
    /**
     * worker untuk membaca data dari data container. ini di pergunakan kalau anda berencana memfilter data dalam grid. 
     */
    fetcherDataFromDataContainer?: (dataContainer: editorsupport.ClientSideEditorContainer<DATA>) => DATA[]; 

    /**
     * data awal untuk di load ke dalam grid
     */
    initialData ?: DATA[] ; 
    /**
     * handler kalau row di click
     */
    rowClickHandler?: ( data: DATA  , rowIndex: number) => any ; 
    
    /**
     * generator footer. sekalian dengan tag tfoot
     */
    customFooterPanelGenerator  ?: ( container: editorsupport.ClientSideEditorContainer<DATA>) => JSX.Element ; 
    /**
     * generator initial state untuk row(untuk keperluan sub row). misal anda perlu expand collapse panel
     * @param data data untuk di buatkan state nya
     * @param rowIndex index dari row untuk di render
     */
    generatorInitialRowStateData ?: (data: DATA , rowIndex: number ) => {[id: string]: any } ; 
    /**
     * ini untuk grid normal
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel?: ( parameter: SimpleGridAfterRowDataPanelGeneratorParameter<DATA>) => JSX.Element[] ; 
    /**
     * lookup container
     */
    lookupContainers ?: {[id: string ]: CommonCommunicationData.CommonLookupValue[]} ; 
     /**
      * untuk grid dengan renderer jqgrid
      */
    scrollableGridParameter ?: SimpleMemoryDrivenGridScrollableProps<DATA> ; 
    /**
     * generator custom style untuk row. untuk manipulasi style row dengan kondisi 
     * @param gridType tipe grid untuk di siapkan props, scrollable(jqgrid) , atau default(table)
     * @param data data untuk di evaluasi
     * @param rowIndex index dari data dalam table
     */
    customRowCssStyleGenerator ?: ( gridType: 'scrollable' |'default' ,  data: DATA , rowIndex: number ) => React.CSSProperties ;  
} 

export interface SimpleMemoryDrivenGridState<DATA> extends BaseGridState<DATA> {
    gridData: DATA[] ; 
    /**
     * di render sebagai jqgrid atau bukan
     */
    renderAsScrollableGrid: boolean ;
    /**
     * action buttons dalam grid
     */
    actionButtons: GridButtonProps<DATA>[]; 
    /**
     * state untuk row
     */
    rowStateContainer: {[id: string]: any }[] ; 
    /**
     * data versi. untuk menandai ada perubahan data
     */
    versionData: number ; 
} 

export class SimpleMemoryDrivenGrid<DATA> extends BaseGrid<DATA, SimpleMemoryDrivenGridProps < DATA > , SimpleMemoryDrivenGridState<DATA>> {

    /**
     * field kalau tipe = simple grid. kalau prop apa perlu di tandai update
     */
    static GRID_COMPARED_CHG_PROPS_SIMPLE: string[]  = ['appendRowNumberColumn',	'columnWidthUnit',	'rowNumberWidth',	'cssName',	'theadCssName',	'rowCssNameProvider',	'hidden',	'customRowCssStyleGenerator',	'actionColumnWidth',	'actionColumnTitle',	'fetcherDataFromDataContainer',	'customRowCssStyleGenerator']; 

    /**
     * props untuk jq grid untuk menandai perubahan item
     */
    static GRID_COMPARED_CHG_PROPS_SCROLLABLE: string[]  = ['appendRowNumberColumn', 'hidden', 'customRowCssStyleGenerator', 'actionColumnWidth', 'actionColumnTitle', 'fetcherDataFromDataContainer', 'customRowCssStyleGenerator']; 

    /**
     * compared state untuk simple grid
     */
    static GRID_COMPARED_CHG_STATE_SIMPLE: string[]  = ['listData'] ; 
    /**
     * table elemen yang di pergunakan dalam simple grid
     */
    simpleTableRef: HTMLTableElement ; 
    /**
     * reference ke grid scrollable
     */
    scrollableGrid: JqMemoryDrivenGridPanel<DATA >; 
    /**
     * register change handler untuk data container. untuk melepas pada saat unmount
     */
    private unregisterDataContainerChangeHandler: editorsupport.UnregisterChangeHandlerWorker ; 
    constructor(props: SimpleMemoryDrivenGridProps < DATA >) {
        super(props);
         
        this.state = {
            gridData: null !, 
            renderAsScrollableGrid : true , 
            actionButtons : this.actionButtons, 
            columnDefinitions : [] , 
            rowStateContainer : [] , 
            versionData: 1 
        };
    }

    shouldComponentUpdate(nextProps: SimpleMemoryDrivenGridProps < DATA > , nextState: SimpleMemoryDrivenGridState<DATA>) {
        let propKeys: string[] = SimpleMemoryDrivenGrid.GRID_COMPARED_CHG_PROPS_SIMPLE ; 
        if ( this.state.renderAsScrollableGrid) {
            propKeys = SimpleMemoryDrivenGrid.GRID_COMPARED_CHG_PROPS_SCROLLABLE ; 
            for ( let k of  SimpleMemoryDrivenGrid.GRID_COMPARED_CHG_STATE_SIMPLE) {
                if ( nextState[k] !== this.state[k]) {
                    return true ; 
                }
            }
        }
        for ( let k of  propKeys) {
            if ( nextProps[k] !== this.props[k]) {
                return true ; 
            }
        }
        if ( nextState.versionData !== this.state.versionData ) {
            return true ; 
        }
        let cmp: Array<boolean> = this.readButtonEnableFlag() ; 
        try {
            if ( !ObjectUtils.hiLevelArrayCompare(cmp , this.buttonEnabledFlagArray)) {
                return true ; 
            }
            if ( !isNull(cmp) && !isNull(cmp)) {
                for ( let i = 0 ; i < cmp.length ; i++ ) {
                    if ( cmp[i] !== this.buttonEnabledFlagArray[i]) {
                        return true ; 
                    }
                }
    
            }    
        } finally {
            this.buttonEnabledFlagArray = cmp; 
        }
        return false ; 
    }

    /**
     * menandai state dari grid berganti. agar komponen dari grid ter reload
     */
    updateState: () => any =  () => {
        if ( this.state.renderAsScrollableGrid) {
            this.scrollableGrid.updateState() ;
        } else {
            this.setStateHelper(st => {
                //
            }) ; 
        }
        
    }

    /**
     * meminta lookup container yang di pakai grid
     */
    getLookupContainer (): {[id: string]: CommonCommunicationData.CommonLookupValue[]}  {
        return this.props.lookupContainers! ; 
    }
    getGridData(): DATA[] {
        return this.state.gridData;
    }

    /**
     * generate sub panel row. di bawah data. ini format table bebas
     * @param data grid data
     * @param rowIndex index dari data
     */
    populateSubRow (data: DATA , rowIndex: number ): JSX.Element[]  {
        if ( isNull(this.props.generatorAfterRowDataPanel)) {
            return null!; 
        }
        return this.props.generatorAfterRowDataPanel!({
            data: data , 
            rowIndex: rowIndex , 
            columnDefinitions : this.state.columnDefinitions , 
            rowStateContainer : this.getGridRowState(rowIndex) , 
            updateGrid : this.updateState.bind(this)
            // data , rowIndex , this.state.columnDefinitions , this.getRowStateData(rowIndex)
        });
    }

    /**
     * membaca state untuk di ambil
     * @param rowIndex index dari row yang di ambil
     */
    getGridRowState ( rowIndex: number ): {[id: string]: any } {
        if ( rowIndex < 0 &&  rowIndex >= this.state.rowStateContainer.length ) {
            return null! ; 
        }
        return this.state.rowStateContainer[rowIndex];
    }

    /**
     * pindahan generate definition
     */
    generateGridDefinition ( prop: SimpleMemoryDrivenGridProps<DATA> , targetState: SimpleMemoryDrivenGridState<DATA> ) {
        if (!isNull( prop.initialData) ) {
            this.assignData(prop.initialData! , targetState);
        }
        if ( isNull(prop.scrollableGridParameter) || !this.isScrollableGridAllowed () ) {
            targetState.renderAsScrollableGrid = false ;
        }
        let gridType:  'simple' |'scrollable' = targetState.renderAsScrollableGrid  ? 'scrollable' : 'simple' ;  
        if ( !isNull(prop.dataContainer)) {
            let data: any[]  = isNull(prop.fetcherDataFromDataContainer) ? prop.dataContainer.getAllStillExistData()! : prop.fetcherDataFromDataContainer!(prop.dataContainer); 
            this.assignData(data , targetState);
            this.unregisterDataContainerChangeHandler  =  prop.dataContainer.registerChangeHandler(() => {
                this.setStateHelper (st => {
                    st.versionData = st.versionData + 1 ; 
                    let chgData: any []  = isNull(prop.fetcherDataFromDataContainer) ? prop.dataContainer.getAllStillExistData()! : prop.fetcherDataFromDataContainer!(prop.dataContainer); 
                    this.assignData(chgData , st);
                });
            });
        }
        let rightAlign: any = { textAlign: 'right' };
        let appendRowNumberColumn: boolean = true;
        if (!isNull(prop.appendRowNumberColumn)) {
            appendRowNumberColumn = prop.appendRowNumberColumn!;
        }
        targetState.columnDefinitions = [];
        if (appendRowNumberColumn) {
            let renderer: (param: GridColumnCustomFormatterParameter<DATA> ) => JSX.Element = ( param: GridColumnCustomFormatterParameter<DATA> ) => {
                
                let  rowIndex: number = param.rowIndex ; 
                let startRow: number = 0;
                if (!isNull(prop.rowNumberWidth)) {
                    return (
                    <td
                        key={'row_number_' + rowIndex} 
                        style={{ width: prop.rowNumberWidth + prop.columnWidthUnit , textAlign : 'right' }}
                    >{startRow + rowIndex}
                    </td>
                    );
                }
                return (
                <td
                    key={'row_number_' + rowIndex}
                    style={rightAlign}
                >{startRow + rowIndex}
                </td>);
            };
            let defRoNumb: GridColumnProps<DATA> = {
                label: 'No',
                gridHeaderCssname: 'center',
                width: prop.rowNumberWidth,
                fieldName: null!,
                align: GridDataAlign.right,
                customDataFormatter: renderer
            };
            targetState.columnDefinitions = [defRoNumb];
        }
        // appender 
        let appender: (d: any) => any =
            (processedRow: any) => {
                if (!isNull(processedRow.props.customDataFormatter) || !isNull(processedRow.props.customDataFormatter) || !isNull(processedRow.props.fieldName)) {
                    let d: GridColumnProps<DATA> = processedRow.props;
                    let lbl: string = d.label;
                    let sFormatter: any = d.customValueFormatter;
                    if (!isNull(d.doNotRenderIf) && d.doNotRenderIf) {
                        return;
                    }
                    if ( !isNull(processedRow.onlyRenderedFlag)) {
                        let rndrOnlyFlag: ColumnRenderFlag = processedRow.onlyRenderedFlag ; 
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

                    let b: GridColumnProps<DATA> = {
                        align: d.align,
                        customDataFormatter: d.customDataFormatter,
                        dateValueFormatter: d.dateValueFormatter,
                        customGridHeaderFormatter: d.customGridHeaderFormatter,
                        fieldName: d.fieldName,
                        gridHeaderCssname: d.gridHeaderCssname,
                        label: lbl,
                        
                        numberAsCurrencyFormatter: d.numberAsCurrencyFormatter,
                        rowCssNameProvider: d.rowCssNameProvider,
                        width: d.width,
                        customValueFormatter: sFormatter,
                        customColumnStyleProvider: d.customColumnStyleProvider , 
                        scrollableColumnParam : d.scrollableColumnParam ,
                        
                    };
                    console.log('[SimpleMemoryDrivenGrid] memproses child grid :  ' , processedRow.props , '.column di proses : ' , b );
                    this.state.columnDefinitions.push(b);
                   
                } else if (!isNull(processedRow.props.clickHandler)) {// berarti action button def
                    
                    let salinanBtn: GridButtonProps<DATA> = processedRow.props;
                    /*if (!isNull(salinanBtn.doNotRenderIf) && salinanBtn.doNotRenderIf) {
                        console.log('[SimpleMemoryDrivenGrid] button skipped :  ' ,salinanBtn );
                        return; 
                    } */
                    
                    console.log('[SimpleMemoryDrivenGrid] button appended :  ' , salinanBtn );
                    this.actionButtons.push(salinanBtn);
                }
            };

        let swachld1: any = prop.children;
        let colDefs: any[] = swachld1;
        targetState.actionButtons   = [];
        this.actionButtons = targetState.actionButtons;
        for (let d1 of colDefs) {
            if (isNull(d1)) {
                continue;
            }
            if (Array.isArray(d1)) {
                let swapR: any = d1;
                let sAny: any[] = swapR;
                for (let subComp of sAny) {
                    if (isNull(subComp) || isNull(subComp.props)) {
                        continue;
                    }
                    appender(subComp);
                }
                continue;
            }

            if (isNull(d1.props)) {
                continue;
            }
            appender(d1);

        }

        if (targetState.actionButtons.length > 0) {
            let rendererAction: (param: GridColumnCustomFormatterParameter<DATA>) => JSX.Element = (param: GridColumnCustomFormatterParameter<DATA>) => {
                let s: any = param.data;
                let sButton: any = targetState.actionButtons;
                if (!isNull(prop.actionColumnWidth)) {
                    return (
                    <GridActionColumn
                        buttons={sButton}
                        width={prop.actionColumnWidth + prop.columnWidthUnit}
                        keySuffix={'automate_data_' + param.rowIndex}
                        data={s}
                    />
                    );
                }
                return (
                <GridActionColumn
                    buttons={sButton}
                    keySuffix={'automate_data_' + param.rowIndex}
                    data={s}
                />
                );
            };
            this.state.columnDefinitions.push({
                align: GridDataAlign.center,
                fieldName: '',
                width: prop.actionColumnWidth,
                gridHeaderCssname: 'center',
                label: isNull(prop.actionColumnTitle) ? i18n('general.control-common.grid.action-column', 'action') : prop.actionColumnTitle!,
                customDataFormatter: rendererAction,

            });
           
        }

        targetState.actionButtons = this.actionButtons;
        targetState.columnDefinitions = this.state.columnDefinitions ;
        console.log('[SimpleMemoryDrivenGrid] hasil proses grid , button : ', targetState.actionButtons , '.column def : ' , this.state.columnDefinitions   ); 
    }
    focus () {
        try {
            if ( !isNull(this.scrollableGrid)) {
                this.scrollableGrid.focus(); 
            } else {
                if ( !isNull(this.simpleTableRef)) {
                    this.simpleTableRef.tabIndex = 1000 ; 
                    this.simpleTableRef.focus(); 
                    setTimeout(() => this.simpleTableRef.removeAttribute('tabindex')  , 100);
                }
            }
        } catch ( exc ) {
            console.error('[SimpleMemoryDrivenGrid] gagal focus ke elemen, error : ' , exc );
        }
    }

    /**
     * assign data ke dalam grid
     * @param data data untuk di assign ke grid
     * @param targetState state di data di grid + state row di taruh
     */
    assignData ( data: DATA[] , targetState: SimpleMemoryDrivenGridState<DATA>  ) {
        targetState.gridData = data ; 
        targetState.rowStateContainer = [] ;
        let gen:  (data: DATA , rowIndex: number ) => any = !isNull(this.props.generatorInitialRowStateData) ? this.props.generatorInitialRowStateData! :  (data1: DATA , rowIndex1: number ) => {
            return {}; 
        };
        if ( !isNull(data)) {
            for ( let i = 0 ; i < data.length; i++) {
                this.state.rowStateContainer.push(  gen(data[i] , i) );
            }
        }
        
    }
    componentWillUnmount() {
        if ( !isNull(this.unregisterDataContainerChangeHandler)) {
            this.unregisterDataContainerChangeHandler();
            this.unregisterDataContainerChangeHandler = null !; 
        }
    }
     /*
    componentWillUpdate(nextProps : SimpleMemoryDrivenGridProps<DATA> , nextState : SimpleMemoryDrivenGridState<DATA>) {
       
        let exclds : string[] =['key' , 'ref' , 'children'] ;
        let isChange : boolean  = false ; 
        if ( !ObjectUtils.compareFields(nextProps , this.props , exclds)){
            isChange = true ; 
        } 
        
        if ( !isChange){
            
           let childCurrent : any  = this.props.children ; 
           let childNext : any = nextProps.children ; 
           isChange = ObjectUtils.hiLevelArrayCompare(childCurrent , childNext) ;
           if ( !isChange) {
                let panjang  : number = childCurrent.length  ; 
                for ( let idx  = 0 ; idx< panjang ; idx++) {
                    if ( !ObjectUtils.compareFields( childCurrent[idx].props ,childCurrent[idx].props , exclds )){
                        isChange  = true ;
                        break ; 
                    }
                }

           }
           
        }
        console.log('[SimpleMemoryDrivenGrid#componentWillUpdate] check result : ' , isChange);
        if ( isChange) {
            this.generateGridDefinition(nextProps , nextState);
        }
        
    }*/
    componentWillMount() {
        this.generateGridDefinition(this.props , this.state);
        this.buttonEnabledFlagArray = this.readButtonEnableFlag ()  ; 
        
    }

    render (): JSX.Element {
        if ( this.state.renderAsScrollableGrid) {
            return this.rendererScrollableGrid(); 
        }
        return this.renderSimpleGrid(); 
    }

    rendererScrollableGrid(): JSX.Element {
        let rowDefs: any [] = []; 
        // let swapRowSelHandler: any = this.props.scrollableGridParameter.onRowSelectedHandler;
        if ( !isNull(this.actionButtons) && this.actionButtons.length > 0 ) {
            let idxButton: number = 1 ; 
            for ( let btnProp of this.actionButtons) {
                console.log('memproses button : ' , btnProp);
                if ( !isNull(btnProp.onlyRenderedFlag) && btnProp.onlyRenderedFlag === ColumnRenderFlag.simpleGridOnly ) {
                    console.log('skip .data: ' , btnProp);
                    continue ;
                }
                let btnCss: string = btnProp.iconCssClass ; 
                if ( !isNull(btnProp.scrollableButtonParam) && !isNull(btnProp.scrollableButtonParam!.buttonCss) ) {
                    btnCss = btnProp.scrollableButtonParam!.buttonCss! ; 
                }
                let renderButtonOnColumnFlag: boolean = true ; 
                let showOnlyOnItemSelected: boolean = false ; 
                if ( !isNull(btnProp.scrollableButtonParam) && !isNull( btnProp.scrollableButtonParam!.renderButtonOnColumnFlag)) {
                     renderButtonOnColumnFlag = btnProp.scrollableButtonParam!.renderButtonOnColumnFlag! ;
                }
                if ( !isNull(btnProp.scrollableButtonParam) && !isNull( btnProp.scrollableButtonParam!.showOnlyOnItemSelected)) {
                     showOnlyOnItemSelected = btnProp.scrollableButtonParam!.showOnlyOnItemSelected ;
                }
                let ttl: string = btnProp.label ; 
                let lbl: string = '' ; 
                if ( !isNull(btnProp.scrollableButtonParam!.label)) {
                    lbl = btnProp.scrollableButtonParam!.label!;
                }
                if ( !isNull(btnProp.scrollableButtonParam!.title)) {
                    ttl = btnProp.scrollableButtonParam!.title!;
                }

                let btnPropJq: JqGridButtonProps<DATA> = {
                    buttonCss : btnCss , 
                    buttonTitle : ttl,
                    showOnlyOnItemSelected : showOnlyOnItemSelected, 
                    renderButtonOnColumnFlag : renderButtonOnColumnFlag ,
                    clickHandler : (data: DATA , rowIndex: number ) => {
                        btnProp.clickHandler(data);
                    },
                    doNotRenderIf : btnProp.doNotRenderIf , 
                    label : lbl , 
                    hidden : btnProp.hidden,
                    clickHandlerExtended : btnProp.clickHandlerExtended , 
                    doNotRenderIfCustomEvaluator : btnProp.doNotRenderIfCustomEvaluator , 
                    originalButtonProps : btnProp 
                };
                
                let swap: any = btnPropJq ; 
                rowDefs.push(<GridButton key={'btn_' + idxButton} {...swap}/>); 
                idxButton++;

            }
            
        }
        console.log('[SimpleMemoryDrivenGrid#rendererScrollableGrid] column def : ' , this.state.columnDefinitions );
        let columnToRender: number = this.state.columnDefinitions.length;
        if (!isNull( this.actionButtons) && this.actionButtons.length > 0 ) {
            columnToRender = columnToRender - 1; 
        }
        for ( let idx1 = 0 ; idx1 < columnToRender; idx1++) {
            if (idx1 === 0 && this.props.appendRowNumberColumn) {
                continue  ; 
            }
            let orgProp: GridColumnProps<DATA> = this.state.columnDefinitions[idx1];
            // let swaporgProp: any = orgProp ; 
            // let orgPropDb: GridColumnProps<DATA> = swaporgProp ; 
            if ( !isNull(orgProp.onlyRenderedFlag) && orgProp.onlyRenderedFlag === ColumnRenderFlag.simpleGridOnly ) {
                continue  ;
            }
            // columnTitle={orgProp.label}
            let lebar: number = orgProp.width!; 
            if ( !isNull(orgProp.scrollableColumnParam )) {
                lebar = orgProp.scrollableColumnParam!.width! ;
            }
            let fmtText: any = null ; 
            let fmt: any = orgProp.customDataFormatter ; 
            if (   !isNull(orgProp.customValueFormatter) ) {
                fmtText = orgProp.customValueFormatter;
            }
            rowDefs.push( (
            <JqGridColumn
                align={orgProp.align}
                columnTitle={orgProp.label} 
                fieldName={orgProp.fieldName} 
                width={lebar}
                key={'column_' + idx1}
                textFormatter={fmtText}
                searchDefinition={orgProp.searchDefinition}
                dateValueFormatter={orgProp.dateValueFormatter}
                numberAsCurrencyFormatter={orgProp.numberAsCurrencyFormatter}
                customFormatter={fmt}
            />) );
            
        }
         
        let lebarAct: number = 40 ; 
        if ( !isNull(this.props.scrollableGridParameter) && !isNull(this.props.scrollableGridParameter!.actionColumnWidth)) {
            lebarAct = this.props.scrollableGridParameter!.actionColumnWidth! ; 
            console.log('[SimpleMemoryDrivenGrid] (param availale)action column width :  ', lebarAct   );
        } else {
            console.log('[SimpleMemoryDrivenGrid] action column width :  ', lebarAct , '.data: ' , this.props.scrollableGridParameter );
        }
        let swapDataContainer: any = this.props.dataContainer ; 
        let swapFetcher: any = this.props.fetcherDataFromDataContainer ; 
        let swapRowSel: any = this.props.scrollableGridParameter!.onRowSelectedHandler ; 
        let genRow: any = this.props.scrollableGridParameter!.generatorAfterRowDataPanel ; 
        let statGen: any = this.props.generatorInitialRowStateData; 
        let manualRenderer: any = this.props.scrollableGridParameter!.manualGridRenderer ; 
        let swapCssGen: any = null !; 
        if (!isNull(this.props.customRowCssStyleGenerator)) {
            let hndlr: ( data: DATA , rowIndex: number ) => React.CSSProperties  = ( data: DATA , rowIndex: number ) => {
                return this.props.customRowCssStyleGenerator!('scrollable' , data , rowIndex);
            };
            swapCssGen = hndlr ; 
        }
        return (
        <JqMemoryDrivenGridPanel
            customRowCssStyleGenerator={swapCssGen}
            dataContainer={swapDataContainer}
            gridTitle={this.props.scrollableGridParameter!.gridTitle}
            actionColumnTitle={this.props.actionColumnTitle}
            actionColumnWidth={lebarAct}
            fetcherDataFromDataContainer={swapFetcher}
            gridHeight={this.props.scrollableGridParameter!.gridHeight}
            gridId={this.props.scrollableGridParameter!.gridId}
            gridMinimumWidth={this.props.scrollableGridParameter!.gridMinimumWidth}
            hidden={this.props.hidden}
            onRowSelectedHandler={swapRowSel}
            saveStateKey={this.props.scrollableGridParameter!.saveStateKey}
            spaceUsedOnLeftSide={this.props.scrollableGridParameter!.spaceUsedOnLeftSide}
            spaceUsedOnRightSide={this.props.scrollableGridParameter!.spaceUsedOnRightSide}
            rowNumberParam={this.props.scrollableGridParameter!.rowNumberParam}
            key='scrollable_grid'
            generatorAfterRowDataPanel={genRow}
            generatorInitialRowStateData={statGen}
            width={this.props.scrollableGridParameter!.width}
            manualRowRenderer={manualRenderer}
            lookupIds={this.props.scrollableGridParameter!.lookupIds}
            noVerticalScroll={this.props.scrollableGridParameter!.noVerticalScroll}
            minimumHeight={this.props.scrollableGridParameter!.minimumHeight}
            ref={(d: any ) => {
                this.scrollableGrid = d ;
            }}
        >{rowDefs}
        </JqMemoryDrivenGridPanel>);
    }

    renderSimpleGrid(): JSX.Element {
        let rows: any[] = [];
        let pnl1: JSX.Element = this.generateFirstRowPanel();
        if (!isNull(pnl1)) {
            rows.push(pnl1);
        }
        let idx: number = 1;
        let datas: DATA[] = this.getGridData();
        if (!isNull(datas)) {
            for (let d of datas) {
                rows.push(this.rendererTaskRowGenerator(idx, d , this.props.rowClickHandler));
                idx++;
            }
        }
        let headerCol: JSX.Element[] = [];
        let i: number = 1;
        for (let c of this.state.columnDefinitions) {
            if (!isNull(c.customGridHeaderFormatter)) {
                headerCol.push(c.customGridHeaderFormatter!());
            } else {
                if (!isNull(c.width)) {
                    headerCol.push(<th style={{width : c.width + this.props.columnWidthUnit}} key={'header_col_' + i} className={c.gridHeaderCssname}>{c.label}</th>);
                } else {
                    headerCol.push(<th key={'header_col_' + i} className={c.gridHeaderCssname}>{c.label}</th>);
                }

            }
            i++;
        }
        let dispStyle: any = {};
        if (!isNull(this.props.hidden) && this.props.hidden) {
            dispStyle.display = 'none';
        }
        return (
        <table 
            className={this.props.cssName}
            id={this.props.tableId}
            style={dispStyle}
            tabIndex={1000}
            ref={tbl => {
                this.simpleTableRef = tbl !; 
            }}
        >
            <thead key='head'>
                <tr style={{ display: 'none' }}><td>{this.props.children}</td></tr>
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
     * worker untuk render footer 
     */
    rendererTaskFooter (): JSX.Element {
        if ( !isNull(this.props.customFooterPanelGenerator) ) {
            return this.props.customFooterPanelGenerator!(this.props.dataContainer);
        }
        return  <tfoot style={{display : 'none'}}>{}</tfoot>;
    }

}