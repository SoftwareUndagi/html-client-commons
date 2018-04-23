import * as React from "react";
import { generateQueryValue, SimpleQueryOperator } from './CommonSearchForm';
import { isNull ,  makeIsoDate , makeIsoDateTime  } from 'core-client-commons/index';
import { DatePickerWrapper } from '../DatePickerWrapper';
import { i18n , geneteDateMaxedHour, geneteDate00Hour } from '../../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../BaseHtmlComponent';

export interface QueryDateTextboxFromAndToProps extends BaseHtmlComponentProps {
    /**
     * field query 
     */
    queryField: string;
    /**
     * assign query worker 
     */
    assignQueryHandler: (field: string, whereValue: any) => any;
    /**
     * ini untuk mengeset kalau misal query di pergunakan dalam include model. 
     */
    assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any;
    /**
     * flag 
     */
    isQueryOnIncludeModel?: boolean;
    /**
     * nama model include. ini hanya akan di perhitungkan kalau variable : <i>isQueryOnIncludeModel</i> = true 
     */
    includeModelName?: string ;
    /**
     * as dari include model. kalau association mempergunakan <i>as</i>
     */
    includeAs?: string ;
    /**
     * tab index dari data
     */
    tabIndex?: number;
    /**
     * flag pergunakan inner join atau tidak
     */
    useInnerJoin?: boolean;
    /**
     * css date picker from 
     */
    cssNameFrom?: string;
    /**
     * css date picker untuk to
     */
    cssNameTo?: string;
    /**
     * pas tekan enter di submit atau tidak. default = false 
     */
    invokeSubmitOnEnter?: boolean;
    /**
     * flag submit kalau date di pilih
     */
    invokeSubmitOnDateSelected?: boolean;
    /**
     * ini kalau reload grid perlu custom handler. 
     */
    reloadGridMethod?: () => any;
}

export interface QueryDateTextboxFromAndToState extends BaseHtmlComponentState {
    dateFrom: Date;
    dateTo: Date;
}
/**
 * date picker dengan from + to
 */
export class QueryDateTextboxFromAndTo extends BaseHtmlComponent<QueryDateTextboxFromAndToProps, QueryDateTextboxFromAndToState> {

    constructor(props: QueryDateTextboxFromAndToProps) {
        super(props);
        this.state = {
            dateFrom: null!,
            dateTo: null!
        };
    }

    render(): JSX.Element {
        let lblTo: string = i18n('query.dateFromTo.toLabel', 'to');
        let tabIndexFrom: number = this.props.tabIndex!;
        let tabIndexTo: number = isNull(this.props.tabIndex) ? null! : this.props.tabIndex! + 1;
        return (
        <div className="input-group ">
            <DatePickerWrapper
                customSubmitCommand={this.props.reloadGridMethod}
                invokeSubmitOnDateSelected={isNull(this.props.invokeSubmitOnDateSelected) ? true : this.props.invokeSubmitOnDateSelected}
                invokeSubmitOnEnter={isNull(this.props.invokeSubmitOnEnter) ? true : this.props.invokeSubmitOnEnter}
                key={'date_query_from'}
                changeHandler={(d: Date) => {
                    if (this.state.dateFrom !== d) {
                        this.setStateHelper( 
                            st => {
                                st.dateFrom = d ; 
                            } , 
                            () => {
                                this.assignQueryValue();
                            });
                    }
                } }
                className={this.props.cssNameFrom}
                tabIndex={tabIndexFrom}
            />
            
            <span className="input-group-addon bg-primary">{lblTo}</span>
            <DatePickerWrapper
                customSubmitCommand={this.props.reloadGridMethod}
                invokeSubmitOnDateSelected={isNull(this.props.invokeSubmitOnDateSelected) ? true : this.props.invokeSubmitOnDateSelected}
                invokeSubmitOnEnter={isNull(this.props.invokeSubmitOnEnter) ? true : this.props.invokeSubmitOnEnter}
                key={'date_query_to'}
                changeHandler={(d: Date) => {
                    if (this.state.dateFrom !== d) {
                        this.setStateHelper( 
                            st => {
                                st.dateTo = d ; 
                            } , 
                            () => {
                                this.assignQueryValue();
                            });
                    }
                } }
                className={this.props.cssNameTo}
                tabIndex={tabIndexTo}
            />
        </div>);
    }
    /**
     * worker untuk assign query
     */
    private assignQueryValue() {
        
        let useInnerJoin: boolean = isNull(this.props.useInnerJoin) ? false : this.props.useInnerJoin!;
        let onInc: boolean = isNull(this.props.isQueryOnIncludeModel) ? false : this.props.isQueryOnIncludeModel!;
        let w: any = null;
        if (isNull(this.state.dateFrom) && isNull(this.state.dateTo)) {
            // this.props.assignQueryHandler(this.props.queryField ,null )  ; 
        } else if (!isNull(this.state.dateFrom) && isNull(this.state.dateTo)) {
            w = generateQueryValue(SimpleQueryOperator.GREATER_THEN_EQUAL, makeIsoDate(geneteDate00Hour(this.state.dateFrom)));
            // this.props.assignQueryHandler( this.props.queryField , generateQueryValue(  SimpleQueryOperator.GREATER_THEN_EQUAL ,     this.state.dateFrom)); 
        } else if (isNull(this.state.dateFrom) && !isNull(this.state.dateTo)) {
            w = generateQueryValue(SimpleQueryOperator.LESS_THEN_EQUAL, makeIsoDateTime(geneteDateMaxedHour(this.state.dateTo)) );
            // this.props.assignQueryHandler( this.props.queryField , generateQueryValue(  SimpleQueryOperator.LESS_THEN_EQUAL ,     this.state.dateTo));
        } else if (!isNull(this.state.dateFrom) && !isNull(this.state.dateTo)) {
            w = generateQueryValue(SimpleQueryOperator.BETWEEN, [ makeIsoDate(geneteDate00Hour(this.state.dateFrom)), makeIsoDateTime(geneteDateMaxedHour(this.state.dateTo)) ]);
            // this.props.assignQueryHandler( this.props.queryField , generateQueryValue(  SimpleQueryOperator.BETWEEN ,     [this.state.dateFrom  , this.state.dateTo]));
        }
        if (onInc) {
            if (isNull(this.props.includeModelName) || this.props.includeModelName!.length === 0) {
                console.error('anda tidak meyertakan variable :', this.props.includeModelName, ', where tidak akan bekerja');
            } else {
                this.props.assignQueryOnIncludeModel(this.props.includeModelName!, this.props.queryField, w, useInnerJoin, this.props.includeAs);
            }
        } else {
            this.props.assignQueryHandler(this.props.queryField, w);
        }

    }
}