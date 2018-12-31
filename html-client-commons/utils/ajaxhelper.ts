
import { CommonCommunicationData, isNull , CoreAjaxHelper } from 'core-client-commons/index'; 
import {  stringIsStartsWith } from './CommonUtils';

declare var jQuery: any  ;
declare var fetch: (url: RequestInfo, init?: RequestInit) => Promise<Response>; 

/**
 * utils untuk membantu ajax 
 */
export namespace ajaxhelper {
     /**
      * generate ajax utils. portable tools
      */
    export function generateOrGetAjaxUtils (): ajaxhelper.AjaxUtils {
         let l: ajaxhelper.AjaxUtils  = window['ajaxUtils'] || null ;
         if ( l === null ) {
             l = new ajaxhelper.AjaxUtils() ; 
             window['ajaxUtils'] = l ; 
         }   
         return l ;   

    }
    
    /**
     * kalau base ajax url di override ,(variable : window["baseAjaxUrl"]) di isikan , berarti url ajax bukan lah /
     */
    export function getBaseAjaxUrlConfiguration (): string  {
        let swaP: string = window["baseAjaxUrl"] || null ; 
        if ( swaP == null ) {
            swaP = "" ;
        }
        if (swaP.length > 0 &&  !stringIsStartsWith(swaP, "/")) {
            swaP = "/" + swaP ; 
        }
        if ( swaP.length > 0 &&  stringIsStartsWith(swaP , "/")) {
            swaP = swaP.substr( 0 , swaP.length - 1 ) ; 
        }
        return swaP;  
    }
    
    export class AjaxUtils extends CoreAjaxHelper {
        
        /**
         * constructor util. http akan di pass oleh angular
         */
        constructor ( ) {
            // this.baseUrl = ajaxhelper.getBaseAjaxUrlConfiguration() ; 
            super(ajaxhelper.getBaseAjaxUrlConfiguration());
            
        }

        /**
         * invoke get. 
         * promise : success : data , onfailure : {
         *      message : "pesan error" , 
         *      errorCode : "kode error", 
         *      
         * }
         */
        get (url: string): Promise<any> {
            if ( typeof fetch === 'function') {
                return super.get(url) ; 
            }
            if ( !isNull(this.baseUrl) && this.baseUrl.length > 0) {
                url = this.baseUrl + url ; 
            }
            return new Promise<any>( ( accept: (d: any ) => any  , reject: (exc: any ) => any ) => {
                console.log('[AjaxUtils.get] fetch api tidak tersedia. mempergunakan jQuery ajax untuk hal ini ');
                jQuery.ajax( {
                    url : url ,
                    method : "get"
                }).then( (wrappedJsonData: any ) => {
                    let wData: CommonCommunicationData.CommonsAjaxResponse  = wrappedJsonData ;
                    if ( wData.haveError) {
                        if ( this.doCheckLoginExpired(wrappedJsonData)) {
                            return ; 
                        }
                        reject({ errorCode :  wData.errorCode , message : wData.errorMessage , additionalErrorData : wData['additionalErrorData'] })  ; 
                        return ; 
                    }
                    accept(wData.data) ; 
                    return ; 
                }).fail((exc: any ) => {
                    exc.errorCode  =  "NETWORK_ERROR" ;
                    reject(exc); 
                });
            }) ;  
        }

        /**
         * worker untuk invoke post 
         */
        post (url: string , postParam: any ): Promise<any> {
            if ( typeof fetch === 'function') {
                return super.post(url , postParam) ; 
            }
            if ( !isNull(this.baseUrl) && this.baseUrl.length > 0) {
                url = this.baseUrl + url ; 
            }
            return new Promise<any>( ( accept: (d: any ) => any  , reject: (exc: any ) => any ) => {
                console.log('[AjaxUtils.post] fetch api tidak tersedia. mempergunakan jQuery ajax untuk hal ini ');
                jQuery.ajax( {
                    url : url , 
                    data : postParam , 
                    method : "post"
                }).then( (wrappedJsonData: any ) => {
                    let wData: CommonCommunicationData.CommonsAjaxResponse  = wrappedJsonData ;
                    if ( wData.haveError) {
                        if ( this.doCheckLoginExpired(wrappedJsonData)) {
                            return ; 
                        }
                        reject({ errorCode :  wData.errorCode , message : wData.errorMessage , additionalErrorData : wData['additionalErrorData'] })  ; 
                        return ; 
                    }
                    accept(wData.data) ; 
                    return ; 
                }).fail((exc: any ) => {
                    exc.errorCode  =  "NETWORK_ERROR" ;
                    reject(exc); 
                });
            }) ;  
        }
        getMode (): any  {
            if (!isNull(window['ajaxhelper.AjaxUtils.ENABLE_CROSS_ORIGIN_REQUEST'])) {
                return window['ajaxhelper.AjaxUtils.ENABLE_CROSS_ORIGIN_REQUEST'] ? 'cors' : 'same-origin' ;
            }
            return ajaxhelper.AjaxUtils.ENABLE_CROSS_ORIGIN_REQUEST ? 'cors' : 'same-origin' ; 
        }

        /**
         * invoke method : put
         */
        put (url: string , param?: any ): Promise<any> {
            if ( typeof fetch === 'function') {
                return super.put(url , param); 
            }
            if ( !isNull(this.baseUrl) && this.baseUrl.length > 0) {
                url = this.baseUrl + url ; 
            }
            return new Promise<any>( ( accept: (d: any ) => any  , reject: (exc: any ) => any ) => {
                console.log('[AjaxUtils.post] fetch api tidak tersedia. mempergunakan jQuery ajax untuk hal ini ');
                jQuery.ajax( {
                    url : url , 
                    data : param , 
                    method : "put"
                }).then( (wrappedJsonData: any ) => {
                    let wData: CommonCommunicationData.CommonsAjaxResponse  = wrappedJsonData ;
                    if ( wData.haveError) {
                        if ( this.doCheckLoginExpired(wrappedJsonData)) {
                            return ; 
                        }
                        reject({ errorCode :  wData.errorCode , message : wData.errorMessage , additionalErrorData : wData['additionalErrorData'] })  ; 
                        return ; 
                    }
                    accept(wData.data) ; 
                    return ; 
                }).fail((exc: any ) => {
                    exc.errorCode  =  "NETWORK_ERROR" ;
                    reject(exc); 
                });
            }) ;  
        }
        /**
         * http delete. disingkat agar tidak bentrok dengan statement delete
         */
        del (url: string ): Promise<any> {
            if ( typeof fetch === 'function') {
                return super.del(url) ; 
            }
            if ( !isNull(this.baseUrl) && this.baseUrl.length > 0) {
                url = this.baseUrl + url ; 
            }
            return new Promise<any>( ( accept: (d: any ) => any  , reject: (exc: any ) => any ) => {
                console.log('[AjaxUtils.delete] fetch api tidak tersedia. mempergunakan jQuery ajax untuk hal ini ');
                jQuery.ajax( {
                    url : url , 
                    method : "delete"
                }).then( (wrappedJsonData: any ) => {
                    let wData: CommonCommunicationData.CommonsAjaxResponse  = wrappedJsonData ;
                    if ( wData.haveError) {
                        if ( this.doCheckLoginExpired(wrappedJsonData)) {
                            return ; 
                        }
                        reject({ errorCode :  wData.errorCode , message : wData.errorMessage , additionalErrorData : wData['additionalErrorData'] })  ; 
                        return ; 
                    }
                    accept(wData.data) ; 
                    return ; 
                }).fail((exc: any ) => {
                    exc.errorCode  =  "NETWORK_ERROR" ;
                    reject(exc); 
                });
            }) ;  
        }
        
    }
    
}