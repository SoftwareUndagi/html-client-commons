import { CommonClientConstant } from 'core-client-commons/index';
import { readFormInputValue } from '../../utils/index';

/**
 * constant form search
 */
export class CommonSearchFormConstant {
    /**
     * 
     */
    static SELF_REF_KEY: string = 'selfRef';
}
/**
 * query operator
 */
export enum SimpleQueryOperator {
    /**
     * operator = 
     */
    EQUAL , 
    /**
     * operator !=
     */
    NOT_EQUAL , 

    /**
     * operator <code>nama_field like 'xxx%'</code>
     */
    LIKE_TAIL_ONLY ,
    /**
     * operator <code>nama_field like '%xxx'</code>
     */
    LIKE_FRONT_ONLY , 
    /**
     * operator <code>nama_field like '%xxx%'</code>
     */
    LIKE_BOTH_SIDE ,

    /**
     * operator <code>nama_field not like 'xxx%'</code>
     */
    NOT_LIKE_TAIL_ONLY ,
    /**
     * operator <code>nama_field not like '%xxx'</code>
     */
    NOT_LIKE_FRONT_ONLY , 
    /**
     * operator <code>nama_field not like '%xxx%'</code>
     */
    NOT_LIKE_BOTH_SIDE ,
    /**
     * operator = &lt;
     */
    LESS_THEN  ,
    /**
     * operator : &lt;=
     */
    LESS_THEN_EQUAL, 
    /**
     * operator : &gt;
     */
    GREATER_THEN , 
    /**
     * operator : &gt;=
     */
    GREATER_THEN_EQUAL , 
    /**
     * operator : <code>nama_field between 1 and 2</code>
     */
    BETWEEN , 
    /**
     * operator : <code>nama_field in (1,2,3)</code>
     */
    IN  , 
    /**
     * operator : <code>nama_field not in (1,2,3)</code>
     */
    NOT_IN 
}
/**
 * props input element
 */
export interface SimpleQueryOperatorInputProps {
    /**
     * field query 
     */
    queryField: string ;
    /**
     * query operator
     */
    queryOperator:  SimpleQueryOperator ;
    /**
     * assign query worker 
     */
    assignQueryHandler: ( field: string , whereValue: any  ) => any ; 
    /**
     * ini untuk mengeset kalau misal query di pergunakan dalam include model. 
     */
    assignQueryOnIncludeModel: (modelName: string , fieldName: string ,  whereValue: any , useInnerJoin: boolean, modelAs ?: string ) => any ; 
    /**
     * flag 
     */
    isQueryOnIncludeModel ?: boolean ; 
    /**
     * nama model include. ini hanya akan di perhitungkan kalau variable : <i>isQueryOnIncludeModel</i> = true 
     */
    includeModelName ?: string  ;
    /**
     * flag pergunakan inner join atau tidak
     */
    useInnerJoin ?: boolean ; 
    /**
     * as dari include model. kalau association mempergunakan <i>as</i>
     */
    includeAs?: string; 
    /**
     * ini kalau reload grid perlu custom handler. 
     */
    reloadGridMethod?: () => any ;

}
/**
 * generate where dengan element
 */
export function reactGenerateSearchQuery (input: HTMLElement ,  where: any ) {
    let qField: string = readAriaValue (input , "aria-query-field")  || null! ; 
    if ( qField == null || qField.length === 0) {
        return ; 
    }
    let qOperator: string = readAriaValue (input , "aria-query-operator" )   || "$eq" ;
    // let qType: string = readAriaValue (input ,  "aria-query-value-type") || "string" ;
    let qSkipBlank: string =   readAriaValue (input , "aria-query-skip-blank") || "true" ;
    let multipleEntry: boolean = false ; 
    if ( input['tagName'].toLowerCase() === 'select') {
        if ( input['multiple']) {
            multipleEntry = true ; 
        }
    }
    if ( !multipleEntry) {
        let val: string = readFormInputValue (input) ; 
        if ( val == null) {
            return ; 
        } 
        val = val.trim() ; 
        if ( val.length === 0 && qSkipBlank + "true") {
            return ; 
        }
        let p: any = {} ;
        if (qOperator === CommonClientConstant.QUERY_OPERATOR_LIKE_BOTH) {
                        p['$like'] = '%' + val + '%' ;
        } else if (qOperator === CommonClientConstant.QUERY_OPERATOR_LIKE_TAIL  ) {
            p['$like'] =  val + '%' ;
        } else if (qOperator === CommonClientConstant.QUERY_OPERATOR_LIKE_FRONT  ) {
            p['$like'] = '%' + val ;
        } else {
            p[qOperator] = val ;
        } 
        where[qField] = p;
    } else {
        let val: string[] = readFormInputValue (input).val() ;
        if (val == null || typeof val === 'undefined' || val.length === 0 ) {
            return ; 
        }
        where[qField] = {$in : val} ;
    }
     
}

/**
 * worker untuk generate query
 * @param queryOperator operator
 * @param value value untuk operator
 */
export function generateQueryValue(queryOperatorParam: SimpleQueryOperator, value: any): any {
    let queryOperator: any = queryOperatorParam;
    // let opr: string = '$eq'; 

    if (SimpleQueryOperator.BETWEEN === queryOperator ) {
        return {$between : value};
    } else if (SimpleQueryOperator.EQUAL === queryOperator ) {
        return {$eq : value};
    } else if (SimpleQueryOperator.GREATER_THEN === queryOperator ) {
        return {$gt : value};
    } else if (SimpleQueryOperator.GREATER_THEN_EQUAL === queryOperator ) {
        return {$gte : value};
    } else if (SimpleQueryOperator.IN === queryOperator ) {
        return {$in : value};
    } else if (SimpleQueryOperator.LESS_THEN === queryOperator ) {
        return {$lt : value};
    } else if (SimpleQueryOperator.LESS_THEN_EQUAL === queryOperator ) {
        return {$lte : value};
    } else if (SimpleQueryOperator.LIKE_BOTH_SIDE === queryOperator ) {
        return {$like : value == null || typeof value === 'undefined' ?  '%%' : '%' + value + '%'};
    } else if (SimpleQueryOperator.LIKE_FRONT_ONLY === queryOperator ) {
        return {$like : value == null || typeof value === 'undefined' ?  '%' : '%' + value};
    } else if (SimpleQueryOperator.LIKE_TAIL_ONLY === queryOperator ) {
        return { $like : value == null || typeof value === 'undefined' ?  '%' : value  + '%'};
    } else if (SimpleQueryOperator.NOT_EQUAL === queryOperator ) {
        return {$ne : value};
    } else if (SimpleQueryOperator.NOT_IN === queryOperator ) {
        return {$notIn : value};
    } else if (SimpleQueryOperator.NOT_LIKE_BOTH_SIDE === queryOperator ) {
        return {$notLike : value == null || typeof value === 'undefined' ?  '%%' : '%' + value + '%'};
    } else if (SimpleQueryOperator.NOT_LIKE_FRONT_ONLY === queryOperator ) {
        return {$notLike : value == null || typeof value === 'undefined' ?  '%' : '%' + value};
    } else if (SimpleQueryOperator.NOT_LIKE_TAIL_ONLY === queryOperator ) {
        return {$notLike : value == null || typeof value === 'undefined' ?  '%' : value + '%'};
    }
}

/**
 * membaca aria value
 */
export function readAriaValue ( inputELement: HTMLElement ,  key: string ): string  {
    let d: any = inputELement.attributes[key] || {} ; 
    return d.nodeValue || null ; 
}