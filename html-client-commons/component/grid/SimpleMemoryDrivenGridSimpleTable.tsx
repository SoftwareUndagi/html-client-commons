import * as React from "react";
import { CommonCommunicationData , editorsupport , isNull } from 'core-client-commons';
import { BaseGrid, BaseGridProps , BaseGridState } from './BaseGrid';
import { i18n } from '../../utils/index';
import {  GridDataAlign, GridButtonProps, GridColumnProps ,  GridColumnCustomFormatterParameter,  SimpleGridAfterRowDataPanelGeneratorParameter } from './SimpleGridMetadata';
import { GridActionColumn } from './GridActionColumn';
export interface SimpleMemoryDrivenGridSimpleTableProps<DATA> extends BaseGridProps<DATA>   {

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
    rowClickHandler ?: ( data: DATA  , rowIndex: number) => any ; 
    
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
    generatorAfterRowDataPanel ?: ( parameter: SimpleGridAfterRowDataPanelGeneratorParameter<DATA>) => JSX.Element[] ; 
    /**
     * lookup container
     */
    lookupContainers ?: {[id: string ]: CommonCommunicationData.CommonLookupValue[]} ; 
     /**
      * untuk grid dengan renderer jqgrid
      */
    // scrollableGridParameter ?: SimpleMemoryDrivenGridSimpleTableScrollableProps<DATA> ; 

    /**
     * generator custom style untuk row. untuk manipulasi style row dengan kondisi 
     * @param gridType tipe grid untuk di siapkan props, scrollable(jqgrid) , atau default(table)
     * @param data data untuk di evaluasi
     * @param rowIndex index dari data dalam table
     */
    customRowCssStyleGenerator ?: ( gridType: 'scrollable' |'default' ,  data: DATA , rowIndex: number ) => React.CSSProperties ;  
} 

export interface SimpleMemoryDrivenGridSimpleTableState<DATA> extends BaseGridState<DATA> {
    gridData: DATA[] ; 
   
    /**
     * action buttons dalam grid
     */
    actionButtons: GridButtonProps<DATA>[]; 
    /**
     * state untuk row
     */
    rowStateContainer: {[id: string]: any }[] ; 
} 
export class SimpleMemoryDrivenGridSimpleTable<DATA> extends BaseGrid<DATA, SimpleMemoryDrivenGridSimpleTableProps < DATA > , SimpleMemoryDrivenGridSimpleTableState<DATA>> {
    /**
     * table elemen yang di pergunakan dalam simple grid
     */
    simpleTableRef: HTMLTableElement ; 
    /**
     * register change handler untuk data container. untuk melepas pada saat unmount
     */
    private unregisterDataContainerChangeHandler: editorsupport.UnregisterChangeHandlerWorker ; 
    constructor(props: SimpleMemoryDrivenGridSimpleTableProps < DATA > ) {
        super(props);
        this.state = {
            gridData : null !, 
            actionButtons : this.actionButtons, 
            columnDefinitions : [] , 
            rowStateContainer : []
        };
    }

    /**
     * menandai state dari grid berganti. agar komponen dari grid ter reload
     */
    updateState:  () => any = () => {
        this.setStateHelper (st => {
            //
        }) ; 
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
            data : data , 
            rowIndex : rowIndex , 
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
            return null !; 
        }
        return this.state.rowStateContainer[rowIndex];
    }
    /**
     * pindahan generate definition
     */
    generateGridDefinition ( prop: SimpleMemoryDrivenGridSimpleTableProps<DATA> , targetState: SimpleMemoryDrivenGridSimpleTableState<DATA> ) {
        if (!isNull( prop.initialData) ) {
            this.assignData(prop.initialData! , targetState);
        }
        
        if ( !isNull(prop.dataContainer)) {
            let data: any[]  = isNull(prop.fetcherDataFromDataContainer) ? prop.dataContainer.getAllStillExistData() : prop.fetcherDataFromDataContainer!(prop.dataContainer); 
            this.assignData(data , targetState);
            this.unregisterDataContainerChangeHandler  =  prop.dataContainer.registerChangeHandler(() => {
                this.setStateHelper( 
                    st => {
                        let chgData: any []  = isNull(prop.fetcherDataFromDataContainer) ? prop.dataContainer.getAllStillExistData() : prop.fetcherDataFromDataContainer!(prop.dataContainer); 
                        this.assignData(chgData , st );
                    }
                );
            });
        }
        let rightAlign: any = { textAlign: 'right' } ;
        let appendRowNumberColumn: boolean = true;
        if (!isNull(prop.appendRowNumberColumn)) {
            appendRowNumberColumn = prop.appendRowNumberColumn!;
        }
        targetState.columnDefinitions = [];
        if (appendRowNumberColumn) {
            let renderer: (param: GridColumnCustomFormatterParameter<DATA> ) => JSX.Element = ( param: GridColumnCustomFormatterParameter<DATA> ) => {
                // let data: DATA = param.data ; 
                let  rowIndex: number = param.rowIndex ; 
                let startRow: number = 0;
                if (!isNull(prop.rowNumberWidth)) {
                    rightAlign.width = prop.rowNumberWidth + prop.columnWidthUnit;
                    return (
                    <td
                        key={'row_number_' + rowIndex} 
                        style={rightAlign}
                    >{startRow + rowIndex}
                    </td>);
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
                    console.log('[SimpleMemoryDrivenGridSimpleTable] memproses child grid :  ' , processedRow.props , '.column di proses : ' , b );
                    this.state.columnDefinitions.push(b);
                   
                } else if (!isNull(processedRow.props.clickHandler)) {// berarti action button def
                    
                    let salinanBtn: GridButtonProps<DATA> = processedRow.props;
                    if (!isNull(salinanBtn.doNotRenderIf) && salinanBtn.doNotRenderIf) {
                        console.log('[SimpleMemoryDrivenGridSimpleTable] button skipped :  ' , salinanBtn );
                        return; 
                    } 
                    console.log('[SimpleMemoryDrivenGridSimpleTable] button appended :  ' , salinanBtn );
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
        console.log('[SimpleMemoryDrivenGridSimpleTable] hasil proses grid , button : ', targetState.actionButtons , '.column def : ' , this.state.columnDefinitions   ); 
    }

    focus () {
        try {
           if ( !isNull(this.simpleTableRef)) {
                    this.simpleTableRef.tabIndex = 1000 ; 
                    this.simpleTableRef.focus(); 
                    setTimeout(() => this.simpleTableRef.removeAttribute('tabindex'), 100);
                }
        } catch ( exc ) {
            console.error('[SimpleMemoryDrivenGridSimpleTable] gagal focus ke elemen, error : ' , exc );
        }
    }

    /**
     * assign data ke dalam grid
     * @param data data untuk di assign ke grid
     * @param targetState state di data di grid + state row di taruh
     */
    assignData ( data: DATA[] , targetState: SimpleMemoryDrivenGridSimpleTableState<DATA>  ) {
        targetState.gridData = data ; 
        targetState.rowStateContainer = [] ;
        let gen:  (data: DATA , rowIndex: number ) => any = !isNull(this.props.generatorInitialRowStateData) ? this.props.generatorInitialRowStateData! :  (data2: DATA , rowIndex2: number ) => {
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
    componentWillUpdate(nextProps : SimpleMemoryDrivenGridSimpleTableProps<DATA> , nextState : SimpleMemoryDrivenGridSimpleTableState<DATA>) {
       
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
        console.log('[SimpleMemoryDrivenGridSimpleTable#componentWillUpdate] check result : ' , isChange);
        if ( isChange) {
            this.generateGridDefinition(nextProps , nextState);
        }
        
    }*/
    componentWillMount() {
        this.generateGridDefinition(this.props , this.state);
    }

    render(): JSX.Element {
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
                    headerCol.push(<th style={{width: c.width + this.props.columnWidthUnit }} key={'header_col_' + i} className={c.gridHeaderCssname}>{c.label}</th>);
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
                this.simpleTableRef = tbl! ; 
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
            return this.props!.customFooterPanelGenerator!(this.props.dataContainer);
        }
        return  <tfoot style={{display : 'none'}}>{}</tfoot>;
    }

}