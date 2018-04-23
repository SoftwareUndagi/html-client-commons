import * as React from 'react';
import { OffscreenPanelContainer , DetachPanel } from '../../OffscreenPanelContainer';
import { ColumnResizeAnimation  } from './ColumnResizeAnimation';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';
import { isNull } from 'core-client-commons/index';

export interface JqGridColumHeaderPanelProps extends BaseHtmlComponentProps {
    /**
     * label dari column
     */
    label: string;
    /**
     * lebar dari column
     */
    width: number;
    /**
     * handler kalau header sort di pilih
     */
    onSortChange: (asc: boolean) => any;
    /**
     * sorting dari current data
     */
    sort?: 'asc' | 'desc' | null;
    /**
     * pilihan default sort. kalau 
     */
    defaultSort?: string;
    /**
     * key element
     */
    elementKey: string;
    /**
     * generator panel tambahan
     */
    additionalPanelGenerator ?: () => JSX.Element ; 
    /**
     * tinggi dari grid
     */
    gridHeight: number ; 
    /**
     * lebar grid. ini untuk animasi resize(max geser kanan)
     */
    boundingGridPanelId: string ; 
    /**
     * column defs
     */
    columnIndex: number;
    /**
     * command untuk resize column 
     * @param panelNewWidth lebar baru untuk element
     * @param columnDef definisi column untuk di resize
     */
    resizeColumnCommand: ( columnIndex: number  ,  panelNewWidth: number ) => any ; 
}
export interface JqGridColumHeaderPanelState extends BaseHtmlComponentState {
    //
} 

/**
 * panel column header grid
 */
export class JqGridColumHeaderPanel extends BaseHtmlComponent<JqGridColumHeaderPanelProps, JqGridColumHeaderPanelState> {
    mouseMoveHandlerVariable: any ; 
    mouseUpHandlerVariable: any ; 
    /**
     * command untuk remove resizer
     */
    removeResizer: DetachPanel ; 
    /**
     * panel resize animation
     */
    resizerPanel: ColumnResizeAnimation ; 
    /**
     * element header dari grid. ini untuk di ambil dimensi 
     */
    thElement: HTMLElement ; 
    constructor(props: JqGridColumHeaderPanelProps) {
        super(props);
        this.state = {};
        this.mouseMoveHandlerVariable = this.mouseMoveHandler.bind(this);
        this.mouseUpHandlerVariable = this.mouseUpHandler.bind(this);
    }

    shouldComponentUpdate(nextProps: JqGridColumHeaderPanelProps, nextState: any ): boolean {
        for ( let f of ['sort' , 'width' , 'defaultSort' , 'label']) {
            if ( this.props[f] !== nextProps[f]   ) {
                return true ; 
            }
        }
        
        return false ; 
    }

    /**
     * mouse move handler untuk animasi resize header
     */
    mouseMoveHandler( mouseEvent: React.MouseEvent<any> ) {
        let e: any = mouseEvent;
        if (e.stopPropagation) {
            e.stopPropagation();
        } 
        if ( e.preventDefault) {e.preventDefault(); }
        e.cancelBubble = true;
        e.returnValue = false;
        if ( !isNull(this.resizerPanel)) {
            this.resizerPanel.animateResize(mouseEvent.clientX);
        }
        // console.log('[JqGridColumHeaderPanel] mouse positioning : [' , mouseEvent.pageX , '.' , mouseEvent.pageY );
        return false;
    }

    mouseUpHandler ( mouseEvent: React.MouseEvent<any>) {
        
        if ( !isNull(this.removeResizer)) {
            try {
                this.removeResizer(); 
            } catch ( exc ) {
                console.error('[JqGridColumHeaderPanel#mouseUpHandler]Gagal memproses detach panel,error: ' , exc) ; 
            }
            this.removeResizer = null !; 
        }/**/
        let kiri: number = this.thElement.getBoundingClientRect().left ; 
        this.props.resizeColumnCommand( this.props.columnIndex ,  mouseEvent.clientX - kiri);
        console.log('[JqGridColumHeaderPanel] trigger mouse up');
        window.removeEventListener('mousemove' ,   this.mouseMoveHandlerVariable);
        window.removeEventListener('mouseup' ,   this.mouseUpHandlerVariable);
    }

    /**
     * handler untuk mouse down
     */
    mouseDownHandler: ( event: React.MouseEvent <any>) => any = ( event: React.MouseEvent <any>) => {
         if ( !isNull(this.removeResizer)) {
            try {
                this.removeResizer(); 
            } catch ( exc ) {
                console.error('[JqGridColumHeaderPanel#mouseUpHandler]Gagal memproses detach panel,error: ' , exc) ; 
            }
            this.removeResizer = null! ; 
        }
         let dimension: ClientRect = this.thElement.getBoundingClientRect(); 
         this.removeResizer = OffscreenPanelContainer.getOffscreenPanelContainer().appendPanel((
        <ColumnResizeAnimation
            ref={d => {
                this.resizerPanel = d! ;
            }}
            height={this.props.gridHeight}
            top={dimension.top}
            columnLeftSidePosition={dimension.left}
            currentGridRighPosition={dimension.left + dimension.width}
            key={'resizer_' + this.props.elementKey}
            boundingGridPanelId={this.props.boundingGridPanelId}
        />));
        // window.addEventListener('mousemove')
         window.addEventListener('mousemove' ,   this.mouseMoveHandlerVariable);
         window.addEventListener('mouseup' ,   this.mouseUpHandlerVariable);
    }

    render(): JSX.Element {
        let sortPanels: any[] = [];
        if (isNull(this.props.onSortChange) && !isNull(this.props.sort)) {
            sortPanels = [(
            <span 
                key={'sort_panel_' + this.props.elementKey} 
                className="s-ico" 
            >
                <span key={'sort_panel_asc' + this.props.elementKey}  className="ui-grid-ico-sort ui-icon-asc ui-state-disabled ui-icon ui-icon-triangle-1-n ui-sort-ltr">{}</span>
                <span key={'sort_panel_desc' + this.props.elementKey}  className="ui-grid-ico-sort ui-icon-desc ui-state-disabled ui-icon ui-icon-triangle-1-s ui-sort-ltr">{}</span>
            </span>)];
        }
        
        let inpGen: () => JSX.Element = isNull(this.props.additionalPanelGenerator) ? () => { return <input type='hidden'/>; } : this.props.additionalPanelGenerator! ;
        let spacerStyle: React.CSSProperties = {
            // height: '45px !important'
        };
        
        console.log('[JqGridColumHeaderPanel#render] style spacer: ' , spacerStyle ) ;
        return (
        <th
            key={this.props.elementKey + '_root'}
            role="columnheader"
            id={this.props.elementKey + '_root'}
            className="ui-state-default ui-th-column ui-th-ltr"
            style={{ width: this.props.width + 'px', textAlign: 'center' }}
            ref={d => {
                this.thElement = d !; 
            }}
        >
            <span 
                key={this.props.elementKey + 'el1'} 
                onMouseDown={this.mouseDownHandler}
                className="ui-jqgrid-resize ui-jqgrid-resize-ltr"
                style={spacerStyle}
            >&nbsp; 
            </span>
            <div id={"jqgh_" + this.props.elementKey + "_jq_gridcolumnheader"} className="ui-jqgrid-sortable">
                <div 
                    key={this.props.elementKey + 'el2'} 
                    style={{ textAlign: 'center', width: '100%', paddingTop: '0px' }}
                >{this.props.label}
                </div>
                {sortPanels}
                {inpGen()}
            </div>
            
        </th>);
    }

}