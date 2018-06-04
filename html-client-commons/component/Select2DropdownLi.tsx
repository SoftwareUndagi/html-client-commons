import * as React from "react";
import { CommonCommunicationData } from 'core-client-commons/index';
import { isNull  } from '../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';

export interface Select2DropdownLiProps extends BaseHtmlComponentProps {
    data: CommonCommunicationData.CommonLookupValue; 
    onDataSelected: (data: CommonCommunicationData.CommonLookupValue) => any; 
    /**
     * title . hint pada saat di mouse hover
     */
    titleFormatter: (data: CommonCommunicationData.CommonLookupValue) => string; 

    /**
     * formatter label. unutk di render dalam select2
     */
    labelFormatter: (data: CommonCommunicationData.CommonLookupValue) => string;
    /**
     * index dari data
     */
    rowIndex: number;
    /**
     * data yang sudah di filter
     */
    filteredDatas: CommonCommunicationData.CommonLookupValue[]; 
    
} 
export interface Select2DropdownLiState extends BaseHtmlComponentState {
    hovered: boolean; 
} 

export class Select2DropdownLi extends BaseHtmlComponent<Select2DropdownLiProps, Select2DropdownLiState> {
    constructor(props: Select2DropdownLiProps) {
        super(props);
        this.state = {
            hovered: false 
        };
    }

    /**
     * assign hover ke control
     * @param hovered
     */
    assignHoveredState(hovered: boolean) {
        if (this.state.hovered !== hovered) {
            this.setStateHelper ( st => {
                st.hovered = hovered ; 
            }); 
        }
    }

    /**
     * control visible atau tidak
     */
    isVisible(): boolean {
        return (isNull(this.props.filteredDatas) || this.props.filteredDatas.indexOf(this.props.data) >= 0);
    }

    render(): JSX.Element  {
        let clsName: string = "select2-results__option";
        if (this.state.hovered) {
            clsName += ' select2-results__option--highlighted';

        } 

        let disp: any = '';
        if (!isNull(this.props.filteredDatas) && this.props.filteredDatas.indexOf(this.props.data) < 0) {
            disp = 'none';
        }

        return (
        <li
            style={{ display: disp }}
            onClick={() => {
                this.props.onDataSelected(this.props.data);
            }}
            aria-selected={false}
            title={this.props.titleFormatter(this.props.data)}
            key={'select2_data_' + this.props.data.detailCode}
            role='treeitem'
            className={clsName}
            onMouseEnter={() => {
                this.setStateHelper( st => {
                    st.hovered = true ; 
                });
            }}
            onMouseLeave={() => {
                this.setStateHelper( st => {
                    st.hovered = false ; 
                });
            }}
            dangerouslySetInnerHTML={{ __html: this.props.labelFormatter(this.props.data) }} 
        />
        );
    }
} 