import * as React from "react";
import { CommonCommunicationData } from 'core-client-commons';
import { isNull, ObjectUtils  } from '../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';
import { Select2DropdownLi } from './Select2DropdownLi';
/**
 * drop down select 2. ini di taruh off screen , dengan koordinat absolut, sehingga componen seolah menjadi terender menjadi 1 dengan control
 */
export interface Select2DropdownProps extends BaseHtmlComponentProps {
    left: number; 
    top: number;
    width: number; 

    /**
     * lebar minimal dari data. default 200px 
     */
    minimumWidth ?: string ; 
    tabIndex: number; 
    selectId: string; 
    selectedData: CommonCommunicationData.CommonLookupValue;
    data: CommonCommunicationData.CommonLookupValue[];
    onDataSelected: (data: CommonCommunicationData.CommonLookupValue) => any; 

    /**
     *  command untuk hide drop down
     */
    hideDropDownCommand: () => any ; 
    /**
     * formatter label. unutk di render dalam select2
     */
    labelFormatter: (data: CommonCommunicationData.CommonLookupValue) => string;
    /**
     * title . hint pada saat di mouse hover
     */
    titleFormatter: (data: CommonCommunicationData.CommonLookupValue) => string; 

    /**
     * ini untuk memfilter data dalam drop down select 2
     */
    queryDataFilter: (query: string, data: CommonCommunicationData.CommonLookupValue) => boolean; 
}
export interface Select2DropdownState extends BaseHtmlComponentState {
    
    /**
     * query data
     */
    query: string|null; 

    selectedIndex: number; 

    /**
     * data yang sudah di filter 
     */
    filteredData: CommonCommunicationData.CommonLookupValue[]|null; 
}

/**
 * panel drop down dari data
 */
export class Select2Dropdown extends BaseHtmlComponent <Select2DropdownProps, Select2DropdownState> {
    /**
     * drop downs
     */
    options: Select2DropdownLi[]; 

    constructor(props: Select2DropdownProps) {
        super(props);
        this.options = []; 
        this.state = {
            query: null,
            // hoveredData : null  , 
            selectedIndex: -1,
            filteredData : props.data 
        };
    }

    componentWillReceiveProps(nextProps: Select2DropdownProps) {
        let s: any = null ; 
        if (nextProps.queryDataFilter !== this.props.queryDataFilter || ObjectUtils.compareFieldsArray(nextProps.data, this.props.data, s)) {
            let swapState: any = this.state ; 
            swapState.filteredData = []; 
            this.applyDataFilter(swapState.query, nextProps.data, swapState.filteredData);
        }  
    }

    navigateByIndex(isIncrement: boolean) {
        if (isNull(this.props.data)) {
            return; 
        }
        let start: number = this.state.selectedIndex; 
        let inc: number = +1;
        if (!isIncrement) {
            inc = -1; 
        }

        do {
            start += inc;
            if (isNull(this.options[start])) {
                continue; 
            }
            if (this.options[start].isVisible()) {
                break;
            }
        } while (start >= 0 && start < this.props.data.length);
        if (start !== this.state.selectedIndex) {
            this.setStateHelper ( 
                st => {
                    st.selectedIndex = start ; 
                } , 
                ( ) => {
                for (let i = 0; i < this.props.data.length; i++) {
                    if (isNull(this.options[i])) {
                        continue; 
                    }
                    if (this.options[i].state.hovered && start !== i) {
                        this.options[i].assignHoveredState(false);
                    } else if (i === start) {
                        this.options[i].assignHoveredState(true);
                    }
                }
            }); 
        }

    } 
    onEnterPressed () {
        if ( this.state.selectedIndex < 0) {
            this.props.hideDropDownCommand(); 
            return ; 
        }

        let actData: CommonCommunicationData.CommonLookupValue[] = this.props.data ;
        if (!isNull(this.state.query) && this.state.query!.length > 0) {
            for (let lk of this.props.data) {
                if (!this.props.queryDataFilter(this.state.query!, lk)) {
                    continue;
                }
                actData.push(lk);
                
            }
        }
        if  ( this.state.selectedIndex >= actData.length) {
            this.props.hideDropDownCommand(); 
            return ;
        }
        this.props.onDataSelected(actData[this.state.selectedIndex]);
    }

    render(): JSX.Element {
        // let opts: JSX.Element[] = [];
        // let index: number = 0 ; 
        /*if ( ! isNull( this.props.data) ){
            if (!isNull(this.state.query) && this.state.query.length > 0) {
                for (let lk of this.props.data) {
                    if (!this.props.queryDataFilter(this.state.query, lk)) {
                        continue;
                    }
                    opts.push(this.rendererTaskOption(lk ,index++));
                }
            } else {
                for (let lk of this.props.data) {
                    opts.push(this.rendererTaskOption(lk , index++));
                    index++; 
                }
            }
        }
        if (!isNull(this.state.filteredData) && this.state.filteredData.length > 0) {
            for (let d of this.state.filteredData) {
                opts.push(this.rendererTaskOption(d, index++));
            }
        } else {
            console.warn('[Select2DropDown] data terfilter kosong');
        }
        */
        return ( 
        <span 
            className="select2-container select2-container--default select2-container--open"
            style={{
                position: 'absolute',
                left: this.props.left + 'px',
                top: this.props.top +  'px'
            }}
        >
            <span
                key='dropdown_level1.1'
                className="select2-dropdown select2-dropdown--below"
                dir="ltr"
                style={{ width: this.props.width + 'px' , minWidth : isNull(this.props.minimumWidth) ? '200px' : this.props.minimumWidth }}
            >
                <span
                    className="select2-search select2-search--dropdown"
                    key='dropdown_level2.1'
                >
                    <input
                        onChange={(evt: any) => {
                            let val: string = evt.target.value;
                            if (!isNull(val)) {
                                val = val.toLowerCase();
                            }
                            if (this.state.query !== val) {
                                this.setStateHelper ( st => {
                                    st.filteredData = [] ; 
                                    this.applyDataFilter(val, this.props.data, st.filteredData);
                                    st.query = val;
                                    console.warn('fire change');
                                }) ; 
                            } else {
                                console.warn('tidak trigger query>>val : ', val, '.state:', this.state.query);
                            }
                        } }
                        onKeyDown={(evt: any) => {
                            if ( evt.which === 27 ) {
                                this.props.hideDropDownCommand();
                            }
                            if ( evt.which === 40 ) {
                                this.navigateByIndex(true);
                            }
                            if ( evt.which === 38 ) {
                                this.navigateByIndex(false);
                            }
                            if ( evt.which === 13) {
                                this.onEnterPressed(); 
                            }
                            console.warn('Key down>>, state :', this.state.query, '.which : ', evt.which);
                        } }
                        key='search_textbox'
                        autoFocus={true}
                        className="select2-search__field"
                        type="search"
                        tabIndex={this.props.tabIndex}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false} 
                        role="textbox"
                    />
                </span>
                <span className="select2-results" key='dropdown_level2.2'>
                    <ul 
                        className="select2-results__options"
                        role="tree"
                        id={this.props.selectId +  "-results"}
                        aria-expanded="true" 
                        aria-hidden="false"
                    >{this.renderDropDowns()}
                    </ul>
                </span>
            </span>
        </span>
            );
    }
    /**
     * untuk menyalin data dari un filtered ke versi filtered
     * @param query query untuk filter data
     * @param data data lookup untuk di filter
     * @param filteredDataContainer data yang terfilter, ini berasal dari state.filteredData
     */
    private applyDataFilter(query: string, data: CommonCommunicationData.CommonLookupValue[], filteredDataContainer: CommonCommunicationData.CommonLookupValue[]) {
        console.log('[Select2Dropdown#applyDataFilter] filter query :', query);
        if (isNull(query) || query.length === 0) {
            filteredDataContainer.push(...data);
            console.log('[Select2Dropdown#applyDataFilter] 0 length query, semua di terima' );
            return; 
        }
        for (let lk of data) {
            if (!this.props.queryDataFilter(query, lk)) {
                console.log('[Select2Dropdown#applyDataFilter] data di skip untuk query :  ', query , lk );
                continue;
            }
            filteredDataContainer.push(lk);
        }
        console.log('[Select2Dropdown#applyDataFilter] final result ', filteredDataContainer);
    }

    /**
     * render semua drop down
     */
    private renderDropDowns(): JSX.Element[] {
        console.log('[Select2Dropdown] render drop down');
        let opts: any[] = [];
        let s: any = null; 
        if (isNull(this.props.data) || this.props.data.length === 0) {
            console.log('[Select2Dropdown] data dari props kosong, dropw down akan kosong');
            return s; 
        }
        let idx: number = 0; 
        for (let o of this.props.data) {
            opts.push(this.renderDropDownHelper(idx , o));
            idx++; 
        }
        return opts; 
    }
    private renderDropDownHelper(idx: number, o: CommonCommunicationData.CommonLookupValue) {
        let f: any = this.state.filteredData;
        return (
        <Select2DropdownLi
            ref={(d: any) => {
                this.options[idx] = d;
            }}
            rowIndex={idx}
            data={o}
            filteredDatas={f}
            key={'row_' + o.detailCode}
            labelFormatter={this.props.labelFormatter}
            titleFormatter={this.props.labelFormatter}
            onDataSelected={this.props.onDataSelected}
        />
        );
    }

}
