
import { SecurityRelatedUtil } from '../utils/SecurityRelatedUtil' ;
import { SecurityData } from 'core-client-commons/index';
import { RouteData } from './RouteData';
/**
 * base class untuk react style routes
 */
export abstract class BaseReactRouteHandler {

    /**
     * worker untuk membuat panel. kalau route path sesuai, method ini akan membuat panel untuk handler route
     */
    generateRouteHandler(param: RouteData ): Promise<any> {// (routePath : string  , userPrivilage : CommonClientData.UserPrivilage ,  availableWidth : number  ,user : SecurityData.UserLoginData ): any {
        return new Promise<any> (  ( accept: (n: any ) => any , reject: (exc: any) => any ) => {
            let panelHandler: any = this.generateHandlerPanel(param) ;
            if ( panelHandler === null) {
                accept(null);
                return  ; 
            }
            accept(panelHandler ) ; 
        }); 
        
    }

    get userName (): string  {
        try {
            return SecurityRelatedUtil.getCachedLoginData().username ;
        } catch ( exc ) {
            console.error('[BaseReactRouteHandler] gagal membaca data user login, error : ' , exc ) ; 
            return null! ; 
        }
         
    }

    getCurrentUserId (): number  {
        let d: SecurityData.UserLoginData =  SecurityRelatedUtil.getCachedLoginData() ;
        if ( d == null || typeof d === 'undefined') {
            return null!; 
        }
        return d.userId ; 
    }
    /**
     * kode unker dari user saat ini 
     */
    getCurrentUserKodeUnitKerja (): string {
        let d: SecurityData.UserLoginData =  SecurityRelatedUtil.getCachedLoginData() ;
        d.branchCode = d.branchCode || null! ; 
        if ( d.employeeData !== null ) {
            d.employeeData!.unitOfWork = d.employeeData!.unitOfWork || null! ; 
            return d.employeeData!.unitOfWork != null ? d.employeeData!.unitOfWork.code : null ! ; 
        }
        return d.branchCode ; 
        
    }
    /**
     * handler untuk generate panel
     */
    abstract generateHandlerPanel  ( parameter: RouteData ): any ; // routePath : string  , userPrivilage : CommonClientData.UserPrivilage , kodeUnitKerja: string ,  availableWidth : number  ,user : SecurityData.UserLoginData)  : any  
}