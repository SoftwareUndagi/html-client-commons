import * as React from "react";
import { generateQueryValue, SimpleQueryOperator } from './CommonSearchForm';
import { CommonCommunicationData , isNull } from 'core-client-commons/index';
import { ObjectUtils } from '../../utils/ObjectUtils';
import { SimpleCombobox , SimpleComboboxProps } from '../editor/input-element/SimpleCombobox';
import { BaseHtmlComponent } from "../BaseHtmlComponent";

export interface QuerySimpleComboBoxProps extends SimpleComboboxProps {
   
    /**
     * initial value untuk search
     */
    initialSearchValue ?: string ;
    /**
     * field query 
     */
    queryField: string;
    /**
     * combo formatter
     */
    comboLabelFormater?: (lookup: CommonCommunicationData.CommonLookupValue) => string;

    /**
     * ini di default : query.select2.simple.noneSelectedLabel
     */
    noneSelectedLabel?: string;
    /**
     * append none selected. default = true 
     */
    appendNoneSelected?: boolean;
    /**
     * kalau true , maka kalau input blank akan tidak di sertakan
     */
    doNotIncludeWhenBlank?: boolean;
    /**
     * tab index. kalau di perlukan pengaturan manual
     */
    tabIndex?: number;
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
} 

export interface QuerySimpleComboBoxState {}

/**
 * query select 
 */
export class QuerySimpleComboBox extends BaseHtmlComponent<QuerySimpleComboBoxProps , QuerySimpleComboBoxState> {

    /**
     * label untuk none selected
     */
    static NONE_SELECTED_LABEL: string = '- silakan pilih-';
    constructor(props: QuerySimpleComboBoxProps) {
        super(props) ; 
        this.state = {

        };
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
        if (submit) {
            this.props.reloadGridMethod!();
        }

    }

    render (): JSX.Element {
        let p: SimpleComboboxProps = {} ; 
        ObjectUtils.copyField( this.props , p );
        p.changeHandler = (val: string) => {
            this.changeHandler(val);
            if ( !isNull(this.props.changeHandler)) {
                this.props.changeHandler!(val);
            }
        };
        delete p['queryField'] ; 
        return <SimpleCombobox {...p}/>;
    }

}