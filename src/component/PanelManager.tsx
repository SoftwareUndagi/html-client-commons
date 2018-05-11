import * as React from 'react';
import { isNull } from '../utils/index';
import { BaseHtmlComponent } from './BaseHtmlComponent';
import { PanelManagerContentWrapper } from './PanelManagerContentWrapper';
/**
 * definisi method untuk menutup panel
 */
export interface DetachPanelFromManagerMethod  {

    /**
     * untuk menutup panel
     */
    (): any ; 
}

/**
 * wrapper close command. untuk kemudahan di pass ke dalam panel 
 */
export class WrappedDetachPanelFromManagerMethod  {
    /**
     * command untuk menutup panel
     */
    actualCommand: DetachPanelFromManagerMethod ; 

    close () {
        if ( !isNull(this.actualCommand)) {
            this.actualCommand(); 
        }
        
    }
}
/**
 * panel manager. untuk menaruh element sebagai stack
 */
export interface PanelManager {

    /**
     * handler kalau panel sudah kosong. kembali ke main panel mustinya<br/>
     * ini untuk di register pada root panel
     */
    onPanelCountChange: ( count: number ) => any ; 

    /**
     * menaruh panel dalam stack. ini otomatis akan hide prev panel dalam stack. 
     * panel akan di taruh dalam satack semacam ini : <br/>
     * <div style='border:1px solid red;width:100px;'>
     * <div style='border :1px solid yellow'>Panel 1</div>
     * <div style='border :1px solid green'>Panel 2</div>
     * </div>
     * panel 1 akan hidden pada saat panel 2 di masukan<br/>
     * pada saat panel 2 di remove(misal dengan mempergunakan DetachPanelFromManagerMethod) ataupun cara lain panel 1 akan kembali muncul
     * default untuk hidden panel adalah tidak di render(bukan display='none'), kecuali di kirim via parameter hideWhenNotOnTop
     * @param panel panel yang di taruh 
     * @param hideWhenNotOnTop kalau ini nilai = true maka panel hanya akan di invis pada saat panel di timpa dengan stack lain
     */
    putPanel (panel: JSX.Element, hideWhenNotOnTop ?: boolean  ): DetachPanelFromManagerMethod ; 
    /**
     * remove all panels
     */
    removeAll (): Promise<any> ; 
}

export interface PanelManagerImplProps {

    /**
     * handler kalau panel sudah kosong. kembali ke main panel mustinya
     */
    onPanelCountChange: ( count: number ) => any ;

    /**
     * css untuk div panel manager
     */
    className?: string ; 
}
export interface PanelManagerImplState {

    /**
     * panel children
     */
    childPanels: PanelManagerContentWrapper[] ; 
}

/**
 * panel manager untuk mengatur stack dari app
 */
export class PanelManagerImpl extends BaseHtmlComponent<PanelManagerImplProps, PanelManagerImplState> implements PanelManager {
    /**
     * handler kalau panel sudah kosong. kembali ke main panel mustinya
     */
    onPanelCountChange:  ( count: number ) => any ; 
    /**
     * incrementer untuk key
     */
    keyIncrementer: number = new Date().getTime()  ; 
    /**
     * wrapper panel di index dengan key
     */
    indexedWrapper: {[id: string]: PanelManagerContentWrapper } = {} ; 
    /**
     * key dengan posisi flat
     */
    flatKeys: string[] = [] ; 
    
    constructor (props: PanelManagerImplProps) {
        super(props) ; 
        window['panelManager'] = this ; 
        this.state = {
            childPanels : []
        } ; 
    }
    removeAll(): Promise<any> {
        return new Promise<any > ( (accept: (n: any ) => any ) => {
            this.flatKeys = [] ; 
            this.indexedWrapper = {};
            if ( this.state.childPanels.length === 0  ) {
                accept({}); 
                return ; 
            }
            this.setStateHelper (
            st => {
               st.childPanels  = [] ; 
            } , 
            () => {
                this.fireCountChange(); 
                accept({});
            });
        });
    }
    /**
     * trigger count child berubah
     */
    fireCountChange () {
        let cnt: number = this.state.childPanels.length ; 
        if ( this.onPanelCountChange) {
            this.onPanelCountChange(cnt);
        }
        this.props.onPanelCountChange( cnt );
    }
    putPanel(panel: JSX.Element, hideWhenNotOnTop?: boolean): DetachPanelFromManagerMethod  {
        let key: string = 'wrapper_' + this.keyIncrementer ; 
        this.keyIncrementer++; 
        if ( this.flatKeys.length > 0) {
            let kMkarNotLatest: string = this.flatKeys[this.flatKeys.length - 1]; 
            let w: PanelManagerContentWrapper = this.indexedWrapper[kMkarNotLatest];
            if ( !isNull(w)) {
                w.markLatest(false); 
            }
        }
        this.flatKeys.push(key); 
        let p: any = ( 
                <PanelManagerContentWrapper 
                    key={key}
                    ref={(d) => {
                        this.indexedWrapper[key] = d! ; 
                    }}
                    hiddenWhenNotActive={isNull(hideWhenNotOnTop) ? false : hideWhenNotOnTop!}
                >{panel}
                </PanelManagerContentWrapper>
                );

        let detach: DetachPanelFromManagerMethod = () => {
            this.flatKeys.splice(this.flatKeys.indexOf(key) , 1); 
            delete this.indexedWrapper[key];
            if ( this.flatKeys.length > 0) {
                for ( let fk of this.flatKeys ) {
                    let wrapperPanel: PanelManagerContentWrapper = this.indexedWrapper[fk];
                    if (isNull(wrapperPanel) ) {
                        continue ; 
                    }
                    wrapperPanel.markLatest(this.flatKeys[this.flatKeys.length - 1] === fk );
                }
            }

            this.setStateHelper (
                st => {
                    if ( st.childPanels.indexOf(p) < 0) {
                        return   ; 
                    }
                    // st.childPanels  =  st.childPanels 
                    st.childPanels.splice(st.childPanels.indexOf(p) , 1) ; 
                    return st ; 
                } , 
                () => {
                    this.fireCountChange(); 
                }); 
        };
        this.setStateHelper ( 
            st => {
                st.childPanels.push(p) ;
            }, 
            () => {
                this.fireCountChange(); 
            }); 
        return detach ; 
    }

    render () {
        return (<div style={{ display : this.state.childPanels.length > 0 ? '' : 'none'}} className={this.props.className}>{this.state.childPanels}</div>);
    }

}
/**
 * akses ke panel manager
 */
export function getPanelManager (): PanelManager {
    let w: any = window['panelManager'] ; 
    if ( isNull(w)) {
        throw new Error("Panel maneger tidak di set. panel manager di ambil dari variable : window['panelManager'] silakan di cek kembali"); 
    }
    return w ; 
}