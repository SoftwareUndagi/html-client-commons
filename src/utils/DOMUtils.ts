
/**
 * focus pada div
 * @param element ref ke dom atau id dari element untuk di focus 
 */
export function focusToDiv (element: string |HTMLElement ) {
    if (!element) {
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
    if ( !actEl) {
        return ; 
    }
    let needRemoveTabIndex: boolean = false ; 
    if ( actEl.tabIndex) {
        needRemoveTabIndex = true ; 
        actEl.tabIndex = 9999 ; 
       
    }
    actEl.focus() ;
    if ( needRemoveTabIndex) {
        actEl.addEventListener('blur' , ()  => {
            delete actEl.tabIndex ; 
        })
    } 
}