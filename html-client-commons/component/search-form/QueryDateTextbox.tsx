import * as React from "react";
import { generateQueryValue, SimpleQueryOperatorInputProps } from './CommonSearchForm';
import { isNull } from 'core-client-commons';
import { DatePickerWrapper } from '../DatePickerWrapper';
import { BaseHtmlComponent } from "../BaseHtmlComponent";

export interface QueryDateTextboxProps extends SimpleQueryOperatorInputProps {
    /**
     * initial value untuk search
     */
    initialSearchValue ?: Date ;
    /**
     * tab index
     */
    tabIndex?: number;
    /**
     * css untuk textbox
     */
    className?: string;
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
    /**
     * change handler untuk date picker
     */
    changeHandler ?: (d: Date) => any ; 
}

/**
 * date picker query
 */
export class QueryDateTextbox extends BaseHtmlComponent<QueryDateTextboxProps, any> {

    constructor(props: QueryDateTextboxProps) {
        super(props);
        this.state = {};
    }
    changeHandler: (d: Date) => any = (d: Date) => {
        if ( !isNull(this.props.changeHandler)) {
            this.props.changeHandler!(d) ; 
        }
        let onInc: boolean = isNull(this.props.isQueryOnIncludeModel) ? false : this.props.isQueryOnIncludeModel!;
        let useInnerJoin: boolean = isNull(this.props.useInnerJoin) ? false : this.props.useInnerJoin!;
        let w: any = null;
        if (!isNull(d)) {
            w = generateQueryValue(this.props.queryOperator, d);
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
    render() {
        return (
        <DatePickerWrapper
            changeHandler={this.changeHandler}
            className={this.props.className}
            customSubmitCommand={this.props.reloadGridMethod}
            invokeSubmitOnDateSelected={isNull(this.props.invokeSubmitOnDateSelected) ? true : this.props.invokeSubmitOnDateSelected!}
            invokeSubmitOnEnter={isNull(this.props.invokeSubmitOnEnter) ? true : this.props.invokeSubmitOnEnter!}
            tabIndex={this.props.tabIndex!}
            initalValue={this.props.initialSearchValue!}
        />);
    }
}
