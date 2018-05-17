import * as React from "react";
import { generateQueryValue, SimpleQueryOperator } from './CommonSearchForm';
import { Select2Panel } from '../Select2Panel';
import { CommonCommunicationData ,  isNull , ListOfValueManager } from 'core-client-commons';
import { BaseHtmlComponent } from "../BaseHtmlComponent";

/**
 * control select2 untuk query 
 */
export interface QuerySelect2Props {
    /**
     * initial value untuk search
     */
    initialSearchValue ?: string ;
    /**
     * parameter untuk lookup data. kalau select2 mengandalkan data dari select2
     */
    lookupParameter?: {
        /**
         * id dari lookup. ini untuk di request kembali ke server
         */
        lovId: string;

        /**
         * managaer lookup 
         */
        lookupManager: ListOfValueManager;

        /**
         * lookup containers
         */
        lookupContainers ?:  { [id: string ]: CommonCommunicationData.CommonLookupValue[]};  
    };

    /**
     * field query 
     */
    queryField: string;
    /**
     * combo formatter
     */
    comboLabelFormater ?: (lookup: CommonCommunicationData.CommonLookupValue) => string;

    /**
     * ini di default : query.select2.simple.noneSelectedLabel
     */
    noneSelectedLabel ?: string;
    /**
     * append none selected. default = true 
     */
    appendNoneSelected ?: boolean;
    /**
     * kalau true , maka kalau input blank akan tidak di sertakan
     */
    doNotIncludeWhenBlank ?: boolean;
    /**
     * tab index. kalau di perlukan pengaturan manual
     */
    tabIndex ?: number;
    /**
     * assign query worker 
     */
    assignQueryHandler: (field: string, whereValue: any) => any;

    /**
     * ini untuk mengeset kalau misal query di pergunakan dalam include model. 
     */
    assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any;

    /**
     * filter data
     */
    dataFilter?: (data: CommonCommunicationData.CommonLookupValue) => boolean ;

    /**
     * flag field yang di query berupa numeric atau bukan, kalau numeric, data akan di konversikan menjadi angka terlebih dahulu
     */
    isNumericValue?: boolean;
    /**
     * nama model include. ini hanya akan di perhitungkan kalau variable : <i>isQueryOnIncludeModel</i> = true 
     */
    includeModelName?: string ;
    /**
     * flag pergunakan inner join atau tidak
     */
    useInnerJoin?: boolean;

    /**
     * as dari include model. kalau association mempergunakan <i>as</i>
     */
    includeAs?: string;

    /**
     * pas tekan enter di submit atau tidak. default = true 
     */
    invokeSubmitOnChanged?: boolean;

    /**
     * ini kalau reload grid perlu custom handler. 
     */
    reloadGridMethod?: () => any;
    /**
     * handler pada saat change value
     */
    changeHandler ?: (val: string)  => any ; 
    /**
     * id dari panel yang menjadi owner dari drop down. untuk memberi tahu select 2 musti di attach ke mana
     */
    dropDownContainerPanelId  ?: string ; 
}
/**
 * untuk filter dengan combo box
 */
export class QuerySelect2 extends BaseHtmlComponent<QuerySelect2Props, any> {
    selectId: string;
    constructor(props: QuerySelect2Props) {
        super(props);
        this.state = {};
        this.selectId = 'search_select2_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 1000);
    }

    changeHandler(val: string) {
        if ( !isNull(  this.props.changeHandler) ) {
            this.props.changeHandler!(val) ; 
        }
        let useInnerJoin: boolean = isNull(this.props.useInnerJoin) ? false : this.props.useInnerJoin!;
        let doNotIncludeWhenBlank: boolean = isNull(this.props.doNotIncludeWhenBlank) ? true : this.props.doNotIncludeWhenBlank!;
        let numeric: boolean = !isNull(this.props.isNumericValue) ? this.props.isNumericValue! : false;
        let w: any = null;
        let valQuery: any = val || null;
        if (numeric) {

            if (valQuery == null) {
                if (!doNotIncludeWhenBlank) {
                    w = generateQueryValue(SimpleQueryOperator.EQUAL, valQuery);
                }
            } else {
                if (isNaN(valQuery)) {
                    valQuery = null;
                } else {
                    valQuery = valQuery / 1;
                }
                w = generateQueryValue(SimpleQueryOperator.EQUAL, valQuery);
            }
        } else {
            if (valQuery === '' || valQuery == null) {
                if (!doNotIncludeWhenBlank) {
                    w = generateQueryValue(SimpleQueryOperator.EQUAL, '');
                }
            } else {
                w = generateQueryValue(SimpleQueryOperator.EQUAL, valQuery);
            }
        }
        let onInc: boolean = !isNull(this.props.includeModelName) && this.props.includeModelName!.length > 0;
        if (onInc) {
            this.props.assignQueryOnIncludeModel(this.props.includeModelName!, this.props.queryField, w, useInnerJoin, this.props.includeAs);

        } else {
            this.props.assignQueryHandler(this.props.queryField, w);
        }
        let submit: boolean = true;

        if (!isNull(this.props.invokeSubmitOnChanged)) {
            submit = this.props.invokeSubmitOnChanged!;
        }
        if (submit && !isNull(this.props.reloadGridMethod)) {
            this.props.reloadGridMethod!();
        }

    }
    render() {
        // let appendNoneSelected: boolean = isNull(this.props.appendNoneSelected) ? true : this.props.appendNoneSelected!;
        // let noneSelectedLabel: string = isNull(this.props.noneSelectedLabel) ? i18n('query.select2.simple.noneSelectedLabel', '- please choose -') : this.props.noneSelectedLabel!;
        let s: any = this.props.lookupParameter;
        return (
        <Select2Panel
            dataFilter={this.props.dataFilter}
            changeHandler={val => {
                this.changeHandler(val);
            } }
            
            readonlyState={false}
            lookupParameter={s}
            initialValue={this.props.initialSearchValue} 
        />);
    }
}
