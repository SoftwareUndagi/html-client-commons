import * as React from 'react';
import { JqGridRowColumnPanel } from './JqGridRowColumnPanel';
import { JqGridColumnProps, JqGridManualRowRenderer,  JqRenderSimpleRowParameter    } from './GridPanelComponent';
import { JqAfterDataRowGeneratorParameter } from './JqBaseGridPanel'    ;
import { BaseHtmlComponent } from '../../BaseHtmlComponent';
import { isNull , CommonCommunicationData } from 'core-client-commons';

export interface JqGridRowContainerBasePanelProps<DATA> {

    /**
     * hide data. ini misal karena collapse header atau loading blocker sedang di render
     */
    hideDataDetail: boolean ; 

    /**
     * lebar dari grid
     */
    width: number ; 

    /**
     * tinggi dari grid 
     */
    height: number;

    /**
     * id dari grid
     */
    gridId: string ; 
    /**
     * handler kalau grid scroll
     */
    onGridScrolled: ( ) => any ; 
    /**
     * state container. ini share dengan yang di pergunakan oleh grid. termasuk kalau memakai lookup container yang sama dengan container dari grid
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
    /**
     * lebar grid berdasarkan column width 
     */
    widthComputedColumn: number;

    /**
     * column defs
     */
    columnDefinitions: JqGridColumnProps<DATA>[];
    /**
     * handler kalau row di click. kalau memerlukan task tertentu ( misal aktivasi button)
     */
    onRowSelectedHandler?: (data: DATA, rowIndex: number) => any;
    /**
     * generator initial state untuk row(untuk keperluan sub row). misal anda perlu expand collapse panel
     * @param data data untuk di buatkan state nya
     * @param rowIndex index dari row untuk di render
     */
    generatorInitialRowStateData ?: (data: DATA , rowIndex: number ) => {[id: string]: any } ; 
    /**
     * renderer row manual
     */
    manualRowRenderer ?: JqGridManualRowRenderer<DATA> ; 
    /**
     * ini kalau panel grid menyesuaikan dengan tinggi dari data
     */
    noVerticalScroll ?: boolean ; 
    /**
     * kalkulasi grid tanpa scroller. di trigger kalau data berubah , dan perlu kalkulasi ulang data
     */
    calculateNoVerticalScrollHeight: () => any  ;
    /**
     * generator panel setelah data row. misal kalau memerlukan sub panel, di masukan di sini
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel ?: ( param: JqAfterDataRowGeneratorParameter<DATA>) => JSX.Element[] ; 
    
}
export interface JqGridRowContainerBasePanelState<DATA> {
    /**
     * data list untuk grid. ini unuk di render dalam grid
     */
    listData: DATA[];
    /**
     * index dari selected data
     */
    selectedRowindex: number ; 

    /**
     * container state dari row, data di taruh per row
     */
    rowStateContainer ?:  {[id: string]: any} [] ; 
    /**
     * data yang dalam posisi di pilih
     */
    selectedData: DATA ; 
    /**
     * data lookup sesuai dalam definisi dari grid. ini di pergunakan dalam kasus column definition berisi lookupId
     */
    gridDataJoinedLookups ?: {[id: string]: {[id: string]: CommonCommunicationData.CommonLookupValue} };

}

/** 
 * base class untuk grid row data container
 */
export abstract class JqGridRowContainerBasePanel<DATA , PROPS extends JqGridRowContainerBasePanelProps<DATA> , STATE extends JqGridRowContainerBasePanelState<DATA>> extends BaseHtmlComponent< PROPS , STATE> {

    constructor(props: PROPS) {
        super(props) ; 
        this.state = this.generateDefaultState () ; 
    }
    /**
     * generator default state untuk grid row panel
     */
    abstract generateDefaultState (): STATE ; 
    /**
     * assign data ke dalam grid
     * @param listData
     */
    assignData(listData: DATA[] , targetState: STATE  ) {
        targetState.listData = listData;
        targetState.rowStateContainer = [] ; 
        let stateGenerator: (data: DATA , rowIndex: number ) => {[id: string]: any } = isNull(this.props.generatorInitialRowStateData) ? (data: DATA , rowIndex: number ) => { return {}; } : this.props.generatorInitialRowStateData! ; 
        if ( !isNull(listData)) {
            for ( let i = 0 ; i < listData.length ; i++) {
                 targetState.rowStateContainer.push(stateGenerator(listData[i] , i ));
            }
        }
        if ( !isNull(this.props.noVerticalScroll) && this.props.noVerticalScroll ) {
            setTimeout( this.props.calculateNoVerticalScrollHeight , 100 ); 
        }
    }
    /**
     * update data state. agar grid terupdate
     */
    updateState: () => any = () => {
        this.setStateHelper (st => {
            //
        });
    }
    render (): JSX.Element {
        let style: React.CSSProperties = { height: this.props.height + 'px', width: this.props.width + 'px' , borderRight : '1px solid #E1E1E1'  , borderLeft : '1px solid #E1E1E1'};
        if (this.props.hideDataDetail) {
            style.display = 'none';
        }
        return (
        <div 
            key={this.props.gridId + '_scroller_panel'}
            id={this.props.gridId + '_scroller_panel'}
            className="ui-jqgrid-bdiv"
            onScroll={this.props.onGridScrolled}
            style={style}
        >
            <div
                key={this.props.gridId + 'child1.2.3.1'}
                style={{ position: 'relative' }}
            >
                <div key={this.props.gridId + 'child1.2.3.1.1'}>
                    <span style={{ display: 'none' }}>
                        {this.props.children}
                    </span>
                </div>
                <table
                    key={this.props.gridId}
                    id={this.props.gridId}
                    tabIndex={0}
                    cellSpacing={0}
                    cellPadding={0}
                    role="grid" 
                    aria-multiselectable="false" 
                    aria-labelledby={"gbox_" + this.props.gridId}
                    className="ui-jqgrid-btable"
                    style={{ width: this.props.widthComputedColumn + "px" }}
                >
                    <tbody key={this.props.gridId + '_data_first_row'}>
                        {this.rendererFirstRow()}
                    </tbody>
                    {this.contentRenderer()}
                </table>
            </div>
        </div>);
    }
    /**
     * populate rows
     */
    populateRows (): JSX.Element[] {
        let dataRows: any[] = [];
        let rowIndex: number = 0;
        if (!isNull(this.state.listData) && this.state.listData.length > 0) {
            for (let d of this.state.listData) {
                dataRows.push(this.rendererGridRow({
                    data : d , 
                    rowIndex : rowIndex
                }));
                if ( !isNull(this.props.generatorAfterRowDataPanel)) {
                    let pnls: JSX.Element[] = this.props!.generatorAfterRowDataPanel!({
                        data : d , 
                        columnDefinitions : this.props.columnDefinitions , 
                        rowStateContainer : this.state.rowStateContainer![rowIndex] , 
                        rowIndex : rowIndex , 
                        updateGridState : this.updateState
                    });
                    if ( !isNull(pnls) && pnls.length > 0) {
                        dataRows.push(...pnls);
                    }
                }
                rowIndex++ ;
            }
        }
        return dataRows ; 
    }

    /**
     * state dari grid
     * @param rowIndex 
     */
    getGridRowState: ( rowIndex: number ) => any = ( rowIndex: number ) => {
        if ( rowIndex < 0 ||  isNull(this.state.rowStateContainer) ||  rowIndex >= this.state.rowStateContainer!.length) {
            return null ; 
        }
        return this.state.rowStateContainer![rowIndex] ; 
    }
    /**
     * dalam detail. ini row pertama dalam grid data
     */
    rendererFirstRow(): JSX.Element {
        let tds: any[] = [];
        let idx: number = 1;
        window['latestListData'] =  this.state.listData ; 
        let heightPnlHeight: string =  isNull( this.state.listData) ||  this.state.listData.length === 0  ? '1px' : '0px'; 
        for (let l of this.props.columnDefinitions) {
            tds.push(<td role="gridcell" key={'auto_head_column_' + this.props.gridId + '_' + idx} style={{ height: heightPnlHeight, width: l.width + 'px' }}>{}</td>);
            idx++;
        }
        return (
        <tr 
            key={'auto_head_row1st_' + this.props.gridId} 
            className="jqgfirstrow" 
            role="row" 
            style={{ height: 'auto' }}
        >{tds}
        </tr>) ;

    }
    /**
     * row renderer.untuk render data
     * @param data data unuk di render
     * @param rowIndex index dari row
     */
    private rendererGridRow(param: JqRenderSimpleRowParameter<DATA>): JSX.Element {
        let data: DATA = param.data ;
        let rowIndex: number = param.rowIndex;
        let rowId: string = this.props.gridId + '_row_' + rowIndex;
        let cssRow: string = 'ui-widget-content jqgrow ui-row-ltr ';
        if (data === this.state.selectedData) {
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
                requestGridStateData={this.getGridRowState}
                updateGridStateCommand={this.updateState}
                key={'automated_row_' + rowIndex + '_' + colIndex}
                rowNumber={rowIndex}
                columnNumber={colIndex}
                lookupContainer={this.props.lookupContainers}
                gridDataJoinedLookups={this.state.gridDataJoinedLookups!}
                selectedDataFlag={data === this.state.selectedData}
                columnDefinition={sCol} 
            />));
            colIndex++;
        }
        return (
        <tr 
            key={'automatic_row_' + rowIndex} 
            role="row" 
            id={rowId} 
            tabIndex={-1}
            onMouseEnter={() => {
                document.getElementById(rowId)!.className = cssRow + ' ui-state-hover';
            } }
            onMouseLeave={() => {
                document.getElementById(rowId)!.className = cssRow;
            } }
            onClick={() => {
                if (this.state.selectedData !== data) {
                    this.setStateHelper( st => {
                        st.selectedRowindex = rowIndex;
                        st.selectedData = data;
                    }) ; 
                }
            } }
            className={cssRow}
        >{cols}
        </tr>);
    }
    /**
     * content generator
     */
    private contentRenderer (): any {
        if ( isNull(this.props.manualRowRenderer)) {
            return (<tbody key={this.props.gridId + '_data_tbody'}>{this.populateRows()}</tbody>);
        } else {
            let rtvls: any [] = []; 
            if ( !isNull(this.state.listData) && this.state.listData.length > 0) {
                let tmp: any[ ] = this.props.manualRowRenderer!({
                    columnDefinitions : this.props.columnDefinitions , 
                    data : this.state.listData , 
                    lookupContainers : this.props.lookupContainers , 
                    rowClickHandler : this.props.onRowSelectedHandler , 
                    simpleGridRenderer : this.rendererGridRow.bind(this) , 
                    updateGridStateCommand : this.updateState.bind(this) , 
                    selectedData : this.state.selectedData 
                } ); 
                if ( !isNull(tmp)) {
                    rtvls.push(...tmp);
                }
            }
            return rtvls ; 
        }
    }
} 