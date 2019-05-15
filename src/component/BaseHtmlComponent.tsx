import { BaseComponent  ,  BaseComponentState    ,  BaseComponentProps  } from 'core-client-commons'; 

export interface BaseHtmlComponentProps extends BaseComponentProps {} 
export interface BaseHtmlComponentState extends BaseComponentState {} 

/**
 * base class untuk component. untuk  memasukan general purpose method
 */
export abstract class BaseHtmlComponent<PROPS extends BaseHtmlComponentProps , STATE extends BaseHtmlComponentState> extends BaseComponent<PROPS , STATE> {
    constructor(props: PROPS) {
        super(props) ; 
    }
}