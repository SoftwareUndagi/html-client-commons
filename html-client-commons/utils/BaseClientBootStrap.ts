import { BaseModuleRouteGroup } from '../component/BaseModuleRouteGroup';
export interface ClientBootStrapParameter {

    /**
     * untuk register route handler
     */
    registerRouteHandler: ( routeGroup: BaseModuleRouteGroup ) => any ;
}

/**
 * base class untuk bootstrap client app
 */
export abstract class BaseClientBootStrap {

    /**
     * constructor object
     * @param projectCode code project. untuk prefix data project 
     */
    constructor( public projectCode: string ) {
        window['projectCode'] = projectCode;
    }

    /**
     * run bootstrap client app
     */
    abstract bootStrap ( param: ClientBootStrapParameter ) ; 
}