
import { BaseReactRouteHandler } from './BaseReactRouteHandler';
import {  SecurityData } from 'core-client-commons/index';
import { SecurityRelatedUtil } from "../utils/SecurityRelatedUtil" ;
import { RouteData } from './RouteData';
/**
 * kelompok route untuk 1 module
 */
export abstract class BaseModuleRouteGroup {

    constructor() {
        //
    }

    /**
     * modules handler group
     */
    abstract getRouteHandlers (): BaseReactRouteHandler[] ; 
    /**
     * kode unker dari user saat ini 
     */
    getCurrentUserKodeUnitKerja (): string {
        let d: SecurityData.UserLoginData =  SecurityRelatedUtil.getCachedLoginData() ;
        d.branchCode = d.branchCode || null! ; 
        if ( d == null || d.employeeData == null || d.branchCode === null) {
            return null! ; 
        } 
        if ( d.employeeData != null ) {
            d.employeeData.unitOfWork = d.employeeData.unitOfWork || null ; 
            return d.employeeData.unitOfWork != null ? d.employeeData.unitOfWork.code : null ! ; 
        }
        return d.branchCode ; 
        
    }
    /**
     * worker untuk membuat panel. kalau route path sesuai, method ini akan membuat panel untuk handler route
     * @param availableWidth lebar normal panel yang tersedia
     */
    generateRouteHandler( param: RouteData ): Promise<any> { // routePath : string  , userPrivilage : CommonClientData.UserPrivilage, availableWidth : number  , user : SecurityData.UserLoginData ): any {
        // let kodeUnitKerja: string = this.getCurrentUserKodeUnitKerja() ; 
        return new Promise<any>(( accept: (n: any ) => any , reject: (exc: any  ) => any  ) => {
            let hs: BaseReactRouteHandler[]  = this.getRouteHandlers() ; 
            if ( hs != null && typeof hs !== 'undefined') {
                for ( let h of hs ) {
                    let p: any = h.generateRouteHandler(param ); 
                    if ( p != null && typeof p !== 'undefined') {
                        accept(p);
                        return   ; 
                    }
                }
            }
            accept(null);
        }) ; 
    }
}