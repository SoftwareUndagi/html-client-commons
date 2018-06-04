
import * as React from 'react';
import {  isNull , CloseEditorCommandAsync ,   CommonCommunicationData } from 'core-client-commons/index'; 
import { BaseHtmlComponent } from '../../BaseHtmlComponent';
import { JqGridButtonProps, JqGridColumnProps, JqGridManualRowRenderer, JqRenderSimpleRowParameter } from "./GridPanelComponent";
import { JqAfterDataRowGeneratorParameter } from "./JqBaseGridPanel";
import { JqGridRowPanel } from './JqGridRowPanel';

export interface JqGridContentPanelProps<DATA> {
    width: number; 
    height: number ; 

    /**
     * ini kalau panel grid menyesuaikan dengan tinggi dari data
     */
    noVerticalScroll: boolean ; 
    /**
     * berlaku untuk scrollable grid. minumum height berapa. dalam kasus tidak ada data atau jumah data terlalu sedikit. default di isi 200
     */
    minimumHeight: number;
    /**
     * flag panel hidden atau tidak
     */
    hidden: boolean ; 
    /**
     * id dari grid 
     */
    gridId: string ; 
    /**
     * handler saat div di scroll. panel harus di scroll sesuai dengan posisi
     */
    onScroll: ( scrollLeft: number ) => any ; 
    /**
     * lebar column hasil komputasi(berdasarkan column yang aktiv)
     */
    widthComputedColumn: number ; 
    /**
     * data list untuk grid. ini unuk di render dalam grid
     */
    listData: DATA[];

    /**
     * grid buttons.baik itu button di bawah grid, atau pun button dalam row grid
     */
    gridButtons: JqGridButtonProps<DATA>[];

    /**
     * column defs
     */
    columnDefinitions: JqGridColumnProps<DATA>[];

    /**
     * container state dari row, data di taruh per row
     */
    rowStateContainer ?:  {[id: string]: any} []; 

    /**
     * handler kalau row di click. kalau memerlukan task tertentu ( misal aktivasi button)
     */
    onRowSelectedHandler?: (data: DATA, rowIndex: number) => any;

    /**
     * container lookup actual yang di pakai oleh grid
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };

    /**
     * generator panel setelah data row. misal kalau memerlukan sub panel, di masukan di sini
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel ?: ( param: JqAfterDataRowGeneratorParameter<DATA>) => JSX.Element[] ; 
    /**
     * renderer row manual
     */
    manualRowRenderer ?: JqGridManualRowRenderer<DATA> ; 
    /**
     * state dari grid
     * @param rowIndex 
     */
    getGridRowState: ( rowIndex: number ) => {[id: string]: any} ; 
    /**
     * data lookup sesuai dalam definisi dari grid. ini di pergunakan dalam kasus column definition berisi lookupId
     */
    gridDataJoinedLookups ?: {[id: string]: {[id: string]: CommonCommunicationData.CommonLookupValue} }; 
    /**
     * handler kalau row di pilih
     */
    onRowClick ?: ( data: DATA , rowIndex: number  ) => any ; 
    /**
     * generator custom style untuk row. untuk manipulasi style row dengan kondisi 
     */
    customRowCssStyleGenerator ?: ( data: DATA , rowIndex: number ) => React.CSSProperties ;  

} 
export interface JqGridContentPanelState<DATA> {
    /**
     * data yang sedang di pilih
     */
    selectedData: DATA;

    /**
     * panel untuk di taruh dalam content panels
     */
    onContentPanels: JSX.Element [] ; 

    /**
     * mode dalam view. normal atau blocking panel
     */
    viewMode: 'normal' |'show-block-panel' ; 

}

/**
 * untuk render data pada jqgrid. 
 */
export class JqGridContentPanel<DATA> extends BaseHtmlComponent<JqGridContentPanelProps<DATA> , JqGridContentPanelState<DATA> > {

    /**
     * table yang berisi hanya data. dalam panel yang scrollable
     */
   dataOnlyTable: HTMLTableElement ; 
   constructor(props: JqGridContentPanelProps<DATA>) {
       super(props) ; 
       this.state = {
           selectedData : null! , 
           onContentPanels : null !, 
           viewMode : 'normal'
       };
   }
    /**
     * handler kalau panel di scroll
     */
    onGridScrolled: (evt: any ) => any = (evt: any ) => {
         let scroledElement: HTMLElement = document.getElementById(this.props.gridId + '_scroller_panel')!;
         this.props.onScroll(scroledElement.scrollLeft);
    }
    /**
     * command untuk menaruh panel dalam grid. ini untuk search yang perlu areal lebar. ndak cukup dengan drop down
     */
    putPanelInsideGridCommand ( panels: JSX.Element[] ): CloseEditorCommandAsync {
        this.setStateHelper( st => {
            st.onContentPanels = panels ; 
            st.viewMode = 'show-block-panel' ; 
        }); 
        return () => {
            return this.setStateHelperAsync( st => {
                st.viewMode = 'normal' ; 
                st.onContentPanels = null !; 
            }); 
        };
    }
    /**
     * update data state. agar grid terupdate
     */
    updateState () {
        this.setStateHelper (st => {
            //
        });
    }

    render (): JSX.Element {
        let style: React.CSSProperties = { width: this.props.width + 'px' , borderRight : '1px solid #E1E1E1'  , borderLeft : '1px solid #E1E1E1'};
        if ( isNull(this.props.noVerticalScroll) || ! this.props.noVerticalScroll ||  ( isNull( this.props.listData) ||  this.props.listData.length === 0)) {
            style.height =  this.props.height + 'px' ; 
        } else {

            if ( !isNull(this.props.minimumHeight)) {
                style.minHeight = this.props.minimumHeight + 'px';
            } else {
                // kalau tidak ada vertical scroll, maka set dengan 200(minimal)
                if ( !isNull(this.props.noVerticalScroll) && this.props.noVerticalScroll)    {
                    style.minHeight = '200px';
                }
            }
        }
        if (this.props.hidden) {
            style.display = 'none';
        }
        return (
        <div 
            key={this.props.gridId + '_scroller_panel'}
            id={this.props.gridId + '_scroller_panel'}
            className="ui-jqgrid-bdiv"
            onScroll={this.onGridScrolled}
            style={style}
        >
            {this.renderNormalGridContent ()}
            {this.renderDynamicContentPanel()}
        </div>);
    }
    /**
     * dalam detail. ini row pertama dalam grid data
     */
    rendererFirstRow(): JSX.Element {
        let tds: any[] = [];
        let idx: number = 1;
        let heightPnlHeight: string =  isNull( this.props.listData) ||  this.props.listData.length === 0  ? '1px' : '0px'; 
        for (let l of this.props.columnDefinitions) {
            tds.push(<td role="gridcell" key={'auto_head_column_' + this.props.gridId + '_' + idx} style={{ height: heightPnlHeight, width: l.width + 'px' }}/>);
            idx++;
        }
        return (
        <tr key={'auto_head_row1st_' + this.props.gridId} className="jqgfirstrow" role="row" style={{ height: 'auto' }}>
            {tds}
        </tr>);

    }
    /**
     * populate rows
     */
    populateRows (): JSX.Element[] {
        let dataRows: any[] = [];
        let rowIndex: number = 0;
        if (!isNull(this.props.listData) && this.props.listData.length > 0) {
            for (let d of this.props.listData) {
                dataRows.push(this.rendererGridRow({
                    data : d , 
                    rowIndex : rowIndex
                }));
                // FIXME : untuk normal row, dengan this.props.generatorAfterRowDataPanel, sebaiknya di buatkan component dengan tbody + children nya sekalian
                if ( !isNull(this.props.generatorAfterRowDataPanel)) {
                    let pnls: JSX.Element[] = this.props.generatorAfterRowDataPanel!({
                        data : d , 
                        columnDefinitions : this.props.columnDefinitions , 
                        rowStateContainer : this.props.rowStateContainer![rowIndex] , 
                        rowIndex : rowIndex , 
                        updateGridState : this.updateState.bind(this) , 
                    
                    }/*d , rowIndex , this.state.columnDefinitions , this.state.rowStateContainer[rowIndex]*/);
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
     * panel dynamics
     */
    private renderDynamicContentPanel (): JSX.Element[] {
        if ( this.state.viewMode !== 'show-block-panel') {
            return []; 
        }
        return this.state.onContentPanels ; 
    }

    /**
     * render normal grid panel
     */
    private renderNormalGridContent (): JSX.Element {
        return (
        <div
            id={this.props.gridId + 'child1.2.3.1'}
            key={this.props.gridId + 'child1.2.3.1'}
            style={{ position: 'relative' , display : this.state.viewMode !== 'normal' ? 'none' : ''}}
        >
            <div
                id={this.props.gridId + 'child1.2.3.1.1'}
                key={this.props.gridId + 'child1.2.3.1.1'}
            >
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
                ref={ tbl => {
                    this.dataOnlyTable = tbl!; 
                }}
                role="grid" 
                aria-multiselectable="false" 
                aria-labelledby={"gbox_" + this.props.gridId}
                className="ui-jqgrid-btable"
                style={{width: this.props.widthComputedColumn + "px" }}
            >
                {(() => {
                    if ( isNull(this.props.manualRowRenderer)) {
                        return (
                        <tbody key={this.props.gridId + '_data_tbody'}>
                            {this.rendererFirstRow()}
                            {this.populateRows()}
                        </tbody>);
                    } else {
                        let rtvl: any [] = [
                            <tbody key={this.props.gridId + '_data_tbody'}>
                                {this.rendererFirstRow()}
                            </tbody>
                        ]; 
                        if ( !isNull(this.props.listData) && this.props.listData.length > 0) {
                            let tmp: any[] = this.props.manualRowRenderer!({
                                columnDefinitions : this.props.columnDefinitions , 
                                data : this.props.listData , 
                                lookupContainers : this.props.lookupContainers , 
                                rowClickHandler : this.props.onRowSelectedHandler , 
                                simpleGridRenderer : this.rendererGridRow.bind(this) , 
                                updateGridStateCommand : this.updateState.bind(this) , 
                                selectedData : this.state.selectedData  , 
                                customRowCssStyleGenerator : this.props.customRowCssStyleGenerator
                            } ); 
                            if ( !isNull(tmp)) {
                                rtvl.push(...tmp);
                            }
                        }
                        return rtvl ; 
                        }
                })()}
            </table>
        </div>);
    }
    /**
     * row renderer.untuk render data
     * @param data data unuk di render
     * @param rowIndex index dari row
     */
    private rendererGridRow(param: JqRenderSimpleRowParameter<DATA>): JSX.Element {
        let swapcolumnDefinitions: any = this.props.columnDefinitions ; 
        let swapParam: any = param ; 
        let swaponRowClick: any = this.props.onRowClick ; 
        let swapSelData: any = this.state.selectedData ; 
        let swapCssProvider: any = this.props.customRowCssStyleGenerator ; 
        return (
        <JqGridRowPanel 
            customRowCssStyleGenerator={swapCssProvider}
            columnDefinitions={swapcolumnDefinitions}
            dataParameter={swapParam}
            getGridRowState={this.props.getGridRowState}
            gridId={this.props.gridId}
            gridDataJoinedLookups={this.props.gridDataJoinedLookups}
            lookupContainers={this.props.lookupContainers}
            selectedData={swapSelData}
            key={'row_' + param.rowIndex}
            onRowClick={swaponRowClick}
        />
        );

    }
     
}