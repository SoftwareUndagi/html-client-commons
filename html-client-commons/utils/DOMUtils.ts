
import { isNull } from './CommonUtils';
/**
 * focus pada div
 * @param element ref ke dom atau id dari element untuk di focus 
 */
export function focusToDiv (element: string |HTMLElement ) {
    if ( isNull(element)) {
        return ; 
    }
    let s: any = null ;
    let actEl: HTMLElement = s ; 
    let swap: any = element ; 
    if ( typeof element === 'string') {
        actEl = document.getElementById(swap)! ;
    } else {
        actEl = swap ; 
    }
    if ( isNull(actEl)) {
        return ; 
    }
    let needRemoveTabIndex: boolean = false ; 
    if ( isNull(actEl.tabIndex)) {
        needRemoveTabIndex = true ; 
        actEl.tabIndex = 9999 ; 
        actEl.focus() ; 
    }
    if ( needRemoveTabIndex) {
        setTimeout(
            () => {
                delete actEl.tabIndex ; 
            } ,       
            10 );
        
    }
}