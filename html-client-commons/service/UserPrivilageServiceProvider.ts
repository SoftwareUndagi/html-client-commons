
import { CommonClientData } from "core-client-commons/index" ;
import { SecurityRelatedUtil } from "../utils/SecurityRelatedUtil";

/**
 * provider data security .user privilage dll
 */
export class UserPrivilageServiceProvider {

    /**
     * membaca privilage dari current path
     */
    getCurrentPathPrivilage (): CommonClientData.UserPrivilage {
        let s: any = null ; 
        let loc: string = window.location.hash ;
        let strArr: string[]  =  loc.split("?");
        if ( strArr == null || typeof strArr === "undefined" || strArr.length !== 2 ) {
            return s ;
        }
        let pecahanCode: string[] =  strArr[1].split("=");
        if ( pecahanCode == null || typeof pecahanCode === "undefined" || pecahanCode.length < 2) {
            return s ;
        }
        let codeMenu: any = s ;
        for ( var xxi = 0 ; xxi <  pecahanCode.length ; ) {
            if ( xxi + 1 >= pecahanCode.length ) {
                break ;
            }
            if ( pecahanCode[xxi] === "code") {
                codeMenu  = pecahanCode[xxi + 1 ] ;
                break ;
            }
            xxi = xxi + 2 ;
        }
        if ( codeMenu == null || codeMenu === "") {
            return s ;
        }
        return  SecurityRelatedUtil.getCurrentPrivilage(codeMenu / 1) ;  // this._indexedPrivilage[codeMenu];

    }
}
