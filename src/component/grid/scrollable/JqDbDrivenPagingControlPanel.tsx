
import * as React from 'react';
import { isNull } from '../../../utils/index';
import { BaseComponent } from 'core-client-commons';

export interface JqDbDrivenPagingControlPanelProps {
    /**
     * page saat ini
     */
    page: number ; 
    /**
     * total page yang ada dalam data
     */
    totalDataCount: number ; 
    /**
     * id dari grid
     */
    gridId: string ;
    /**
     * page sizes yang ada
     */
    pageSizes: number [];
    /**
     * index pada variable: pageSized yang di pilih
     */
    selectedPageSizeIndex: number ;  

    /**
     * lebar paging texbox
     */
    pagingTextboxWidth ?: number ; 

    /**
     * pindah halaman
     */
    navigate: (page: number ) => any ; 
    /**
     * handler kalau page size index berubah
     */
    onPageSizeIndexChange: ( index: number ) => any ;
} 

export interface JqDbDrivenPagingControlPanelState {

} 
/**
 * panel control untuk paging control
 */
export class JqDbDrivenPagingControlPanel extends BaseComponent<JqDbDrivenPagingControlPanelProps , JqDbDrivenPagingControlPanelState > {
    get  pageSize (): number  {
        if ( isNull(this.props.pageSizes || this.props.pageSizes!.length === 0 ) ) {
            return 15 ; 
        }
        if ( this.props.selectedPageSizeIndex < 0 || this.props.selectedPageSizeIndex >= this.props.pageSizes.length) {
            return this.props.pageSizes[0];
        }
        return this.props.pageSizes[this.props.selectedPageSizeIndex];
    }
    /**
     * pager sisi tengah. ini biasanya tempat pagin
     */
    render(): JSX.Element {
        let pageSize: number = this.pageSize ; 
        let pageCount: number =  Math.ceil(this.props.totalDataCount / pageSize) ;

        let hideProp: React.CSSProperties = {} ; 
        if (pageCount < 2) {
            // return <input type='hidden' key={this.props.gridId + 'center_footer'} id={this.props.gridId + 'center_footer'} />
            hideProp.display = 'none';
        }
        let nextLastClassName: string = 'ui-pg-button ui-corner-all ';
        let prevClassName: string = 'ui-pg-button ui-corner-all ';
        if (this.props.page >= pageCount - 1) {
            nextLastClassName += 'ui-state-disabled';
        }
        if (this.props.page === 0) {
            prevClassName += 'ui-state-disabled';
        }

        return (
            <table cellSpacing={0} cellPadding={0}  style={{ tableLayout: 'auto', display: 'table' }} className="ui-pg-table">
                <tbody key={this.props.gridId + '_pager_tbody'}>
                    <tr key={this.props.gridId + '_pager_tbody_tr'}>
                        <td 
                            id={"first_" + this.props.gridId + "_pager"}
                            key={"first_" + this.props.gridId + "_pager"}
                            className={prevClassName}
                            onClick={() => {
                                if (this.props.page < 1) {
                                    return;
                                }
                                this.props.navigate(0);
                            } } 
                            style={hideProp}
                        ><span className="ui-icon ace-icon fa fa-angle-double-left bigger-140">{}</span>
                        </td>
                        <td 
                            id={"prev_" + this.props.gridId + "_pager"}
                            key={"prev_" + this.props.gridId + "_pager"}
                            className={prevClassName}
                            onClick={() => {
                                let nxtPage: number = this.props.page - 1;

                                if (this.props.page < 1) {
                                    return;
                                }
                                this.props.navigate(nxtPage);
                            } }
                            style={hideProp}
                        ><span className="ui-icon ace-icon fa fa-angle-left bigger-140"/>
                        </td>
                        <td 
                            key={"spacer_" + this.props.gridId + "_pager"}
                            style={{ width: '4px' , display : (pageCount < 2) ? 'none'  : ''}}
                            className="ui-pg-button ui-state-disabled" 
                        ><span className="ui-separator"/>
                        </td>
                        <td 
                            key={"page_input_" + this.props.gridId + "_pager"} 
                            dir="ltr"
                            style={hideProp}
                        >Halaman
                            <input
                                key={"txt_pager_" + this.props.gridId + this.props.page}
                                id={"txt_pager_" + this.props.gridId}
                                className="ui-pg-input"
                                type="number"
                                min={1}
                                max={pageCount}
                                size={4}
                                style={{width : isNull(this.props.pagingTextboxWidth) ?  '40px' : this.props.pagingTextboxWidth + 'px'  }}
                                maxLength={7}
                                onChange={(evt: any) => {
                                    let valBaru: any = evt.target.value;
                                    console.warn('[DbDrivenGridPanel]val baru : ', valBaru);
                                    if (isNaN(valBaru)) {
                                        return;
                                    }
                                    if (valBaru < 1 || valBaru > pageCount) {
                                        return;
                                    }
                                    if ( valBaru === this.props.page) {
                                        return ; 
                                    }
                                    this.props.navigate(valBaru);

                                } }
                                value={(this.props.page + 1) + ''}
                                role="textbox" 
                            /> dari <span id={"sp_1_" + this.props.gridId + "_main_pager"}>{pageCount}</span>
                        </td>
                        <td className="ui-pg-button ui-state-disabled" style={{ width: '4px' , display : (pageCount < 2) ? 'none'  : ''}}>
                            <span className="ui-separator"/>
                        </td>
                        <td 
                            key={"next_" + this.props.gridId + "_pager"}
                            id={"next_" + this.props.gridId + "_pager"}
                            className={nextLastClassName}
                            onClick={() => {
                                if (this.props.page >= (pageCount - 1)) {
                                    return;
                                }
                                
                                this.props.navigate(this.props.page + 1);
                            } }
                            style={hideProp}
                        ><span className="ui-icon ace-icon fa fa-angle-right bigger-140"/>
                        </td>
                        <td 
                            key={"last_" + this.props.gridId + "_pager"}
                            id={"last_" + this.props.gridId + "_pager"}
                            className={nextLastClassName}
                            onClick={() => {
                                if (this.props.page >= (pageCount - 1)) {
                                    return;
                                }
                                this.props.navigate(pageCount - 1);
                            } }
                            style={hideProp}
                        ><span className="ui-icon ace-icon fa fa-angle-double-right bigger-140"/>
                        </td>
                        <td 
                            key={"combobox_" + this.props.gridId + "_pager"}
                            id={"combobox_" + this.props.gridId + "_pager"} 
                            dir="ltr"
                        >{this.rendererTaskPageSizeCombo()}
                        </td>
                    </tr>
                </tbody>
            </table>
        );

    }

    /**
     * drop down page size. ini default berisi : 15, 30, 45 
     */
    private rendererTaskPageSizeCombo(): JSX.Element {
        let opts: any[] = [];
        let pgs: number[] = [15, 30, 45];
        if ( !isNull(this.props.pageSizes)) {
            pgs = this.props.pageSizes;
        }
        let val: string = '';
        for (let iPgs = 0; iPgs < pgs.length; iPgs++) {
            if (this.props.selectedPageSizeIndex === iPgs) {
                val = pgs[iPgs] + '';
            }
            opts.push(<option key={'paging_value_' + (pgs[iPgs])} role="option" value={pgs[iPgs] + ''}>{pgs[iPgs] + ''}</option>);
        }

        return (
        <select
            key={this.props.gridId + '_page_sizes'}
            className="ui-pg-selbox"
            role="listbox"
            value={val}
            onChange={(evt: any) => {
                let selVal: string = evt.target.value;
                let idx: number = 0;
                let scanIdx: number = 0;
                for (let p of pgs) {
                    if (p + '' === selVal) {
                        idx = scanIdx;
                        break;
                    }
                    scanIdx++;
                }
                if (this.props.selectedPageSizeIndex !== idx) {
                    this.props.onPageSizeIndexChange(idx);

                }
            } }
        >{opts}
        </select>
        );
    }
}