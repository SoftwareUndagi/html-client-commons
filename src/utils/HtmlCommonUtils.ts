/**
 * deploy css ke dalam halaman
 */
export function deployCssWithLink( parameter: { url: string }) : void {
    let lnk: any = document.createElement('link') ; 
    lnk.rel ='stylesheet' ; 
    lnk.href = parameter.url ; 
    window.document.head.appendChild(lnk); 
}

/**
 * deploy script ke dalam halaman
 * @param parameter 
 */
export function deployScript( parameter: { url: string , async: boolean }) : void{
    let script: HTMLScriptElement = document.createElement('script') ; 
    if ( parameter.async) {
        script.async = true ; 
    }
    script.src = parameter.url ; 
    window.document.head.appendChild(script); 
    
}