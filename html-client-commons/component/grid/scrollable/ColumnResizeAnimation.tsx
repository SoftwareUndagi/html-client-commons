import * as React from 'react';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';
export interface ColumnResizeAnimationProps extends BaseHtmlComponentProps {

    /**
     * sisi atas panel
     */
    top: number ; 

    /**
     * tinggi dari panel
     */
    height: number ; 

    /**
     * bagian kiri dari grid. tidak boleh lebih kecil dari pada bagian ini + toleransi 
     */
    columnLeftSidePosition: number ; 
    /**
     * sisi kanan dari grid sekarang berapa, ini sebagai nilai awal dari panel width
     */
    currentGridRighPosition: number ; 
    /**
     * bounding panel. ini untuk di pergunakan animasi
     */
    boundingGridPanelId: string ; 
    
}
export interface ColumnResizeAnimationState extends BaseHtmlComponentState {

    /**
     * lebar dari panel
     */
    panelWidth: number ; 
}
/**
 * panel untuk animasi resize column header
 */
export class ColumnResizeAnimation extends BaseHtmlComponent<ColumnResizeAnimationProps, ColumnResizeAnimationState>  {
    constructor(props: ColumnResizeAnimationProps) {
        super(props) ; 
        this.state = {
            panelWidth : !(props.currentGridRighPosition) ?  100 : props.currentGridRighPosition , 
            // panelWidth : props.currentGridRighPosition 
        }; 
    }

    animateResize ( xPosition: number ) {
        this.setStateHelper ( st => {
            let pnl: HTMLElement = document.getElementById(this.props.boundingGridPanelId)!;
            let bndRect: ClientRect =  pnl.getBoundingClientRect(); 
            let maxKanan: number = bndRect.right ; 
            let minLeft: number = this.props.columnLeftSidePosition + 20 ; 
            console.log('[ColumnResizeAnimation] comparing : ' , xPosition <= minLeft , '.xposition : ' , xPosition , '.maxKanan :' , maxKanan , '.bounding rect : ' , bndRect );
            if ( xPosition <= minLeft) {
                return ; 
            }
            if ( xPosition >=  maxKanan) {
                return ; 
            }
            let lebarBaru: number = xPosition ; // - this.props.columnLeftSidePosition ; 
            console.log('[ColumnResizeAnimation] animate : lebar baru =  ' , lebarBaru , '.lebar sebelumnya : ' , this.state.panelWidth , '.minLeft :' , minLeft ); 
            st.panelWidth =  lebarBaru; 
        }); 
    }
    render (): JSX.Element {
        let style: React.CSSProperties = {
                    borderRight : '1px #307ecc dashed' , 
                    position : 'absolute' , 
                    width : this.state.panelWidth + 'px' , 
                    height : this.props.height + 65 + 'px', 
                    top : this.props.top + 'px', 
                    zIndex : 10001, 
                    // backgroundColor : 'yellow'

                };
        return <div style={style}>{}</div>;
    }
}