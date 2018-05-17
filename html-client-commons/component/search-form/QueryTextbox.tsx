
import * as React from "react";
import { generateQueryValue, SimpleQueryOperator, SimpleQueryOperatorInputProps } from './CommonSearchForm';
import { isNull } from 'core-client-commons';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../BaseHtmlComponent';
/**
 * props untuk textbox query
 */
export interface QueryTextboxProps extends SimpleQueryOperatorInputProps  ,  BaseHtmlComponentProps {

    /**
     * initial value untuk search
     */
    initialSearchValue ?: string ;
    /**
     * kalau true , maka kalau input blank akan tidak di sertakan
     */
    doNotIncludeWhenBlank?: boolean;

    /**
     * tab index
     */
    tabIndex ?: number ; 
    /**
     * nama class untuk css textbox
     */
    className?: string;
    /**
     * disabled
     */
    disabled?: boolean;
    /**
     * mempergunakan number atau tidak
     */
    useNumber?: boolean;
    /**
     * flag pergunakan inner join atau tidak
     */
    useInnerJoin?: boolean;
    /**
     * change handler. kalau di perlukan tambahan
     */
    changeHandler?: (val: string) => any;
    /**
     * pas tekan enter di submit atau tidak. default = true 
     */
    invokeSubmitOnEnter?: boolean;

    /**
     * style untuk textbox
     */
    style?: React.CSSProperties ; 

    /**
     * kalau misal di isikan, query akan mempergunakan in atau not in 
     */
    textSearchMultipleValueParameterConfig ?: {
        /**
         * delimiter per parameter
         */
        delimiter: string  ; 
        /**
         * flag pergunakan not in atau tidak
         */
        useNotIn ?: boolean ; 
    };
}
export interface QueryTextboxState extends BaseHtmlComponentState {
    value: string;
}

/**
 * textbox untuk simple query
 */
export class QueryTextbox extends BaseHtmlComponent<QueryTextboxProps, QueryTextboxState> {
    constructor(props: QueryTextboxProps) {
        super(props);
        this.state = {
            value: props.initialSearchValue!
        };
    }

    generateQueryValue(queryOperatorParam: SimpleQueryOperator, value: any): any {
        if ( !isNull(this.props.textSearchMultipleValueParameterConfig)) {
            if ( isNull(value) || value.length === 0 || value.indexOf(this.props.textSearchMultipleValueParameterConfig!.delimiter) < 0) {
                return generateQueryValue(queryOperatorParam , value) ; 
            } else {
                let r: string[] = value.split(this.props.textSearchMultipleValueParameterConfig!.delimiter); 
                if ( r.length === 0 ) {
                    return {$in : ['no-match@@@as####']};
                }
                let opr: string = '$in' ; 
                if ( !isNull(this.props.textSearchMultipleValueParameterConfig!.useNotIn) && this.props.textSearchMultipleValueParameterConfig!.useNotIn ) {
                    opr = '$notIn' ;
                }
                return {
                    [opr] : r
                };
            }
        } else {
            return generateQueryValue(queryOperatorParam , value) ; 
        }
    }

    componentDidMount () {
        if (!isNull( this.props.initialSearchValue) &&  this.props.initialSearchValue!.length > 0) {
            this.__actualChangeValueHandler(); 
        }
    }
    changeHandler(value: string) {
        if ( this.state.value !== value ) {
            this.setStateHelper( 
            st => {
                st.value = value ;
            } , 
            this.__actualChangeValueHandler.bind(this));
        } else {
            this.__actualChangeValueHandler(); 
        }
    }
    render(): JSX.Element {
        let type: string = 'input';
        if (!isNull(this.props.useNumber) && this.props.useNumber) {
            type = 'number';
        }

        return (
        <input
            style={isNull(this.props.style) ? {} : this.props.style}
            disabled={this.props.disabled}
            className={this.props.className}
            type={type}
            tabIndex={this.props.tabIndex}
            defaultValue={this.props.initialSearchValue}
            onKeyPress={(event: any) => {
                // console.warn('Event keys : ', Object.keys(event));
                // console.warn('charCode:', event.charCode, ',keyCode:', event.keyCode, ',which:', event.which);
                if (event.charCode === 13 || event.keyCode === 13) {
                    let autoSubmit: boolean = true;
                    if (!isNull(this.props.invokeSubmitOnEnter)) {
                        autoSubmit = this.props.invokeSubmitOnEnter!;
                    }
                    if (autoSubmit) {
                        if (!isNull(this.props.reloadGridMethod)) {
                            this.props.reloadGridMethod!();
                        } else {
                            event.target.form.submit();
                        }

                    } else {
                        event.preventDefault();
                    }
                }
            } }
            onChange={(evt: any) => {
                this.changeHandler(evt.target.value);
            } }
        />
        );
    }
    /**
     * change value handler. memproses dari value untuk proses query
     */
    private __actualChangeValueHandler () {
        let useInnerJoin: boolean = isNull(this.props.useInnerJoin) ? false : this.props.useInnerJoin!;
        let onInc: boolean = isNull(this.props.isQueryOnIncludeModel) ? false : this.props.isQueryOnIncludeModel!;
        if (!isNull(this.state.value)) {
            if (this.state.value.length === 0) {
                let w: any = null;
                let doNotIncludeBlank: boolean = isNull(this.props.doNotIncludeWhenBlank) ? true : this.props.doNotIncludeWhenBlank!;
                if (!doNotIncludeBlank) {
                    w = generateQueryValue(this.props.queryOperator, "");
                } 
                if (onInc) {
                    this.props.assignQueryOnIncludeModel(this.props.includeModelName!, this.props.queryField, w, useInnerJoin, this.props.includeAs);
                } else {
                    this.props.assignQueryHandler(this.props.queryField, w);
                }

            } else {
                let w: any = this.generateQueryValue(this.props.queryOperator, this.state.value);
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
        } else {
            if (onInc) {
                this.props.assignQueryOnIncludeModel(this.props.includeModelName!, this.props.queryField, null, useInnerJoin, this.props.includeAs);
            } else {
                this.props.assignQueryHandler(this.props.queryField, null);
            }
        }
    }
}