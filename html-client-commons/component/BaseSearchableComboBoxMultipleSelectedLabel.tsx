import * as React from "react";
import { CommonCommunicationData } from 'core-client-commons/index';
import { isNull } from '../utils/index'; 
import { BaseHtmlComponent } from './BaseHtmlComponent';

export interface BaseSearchableComboBoxMultipleSelectedLabelProps {
    value: string;

    /**
     * flag control readonly atau tidak
     */
    readonlyState: boolean;
    /**
     * penanda data berubah dari induknya
     */
    versioner: number;
    /**
     * id dari lookup induk. untuk membaca data lookup dari lookup manager langsung
     */
    lovId: string;
    /**
     * untuk akses langsung ke cached lookup
     */
    lookupContainer: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
    /**
     * handler untuk click remove
     */
    onRemoveItemClick: (val: string) => any;

    /**
     * untuk render item yang selected . bagian atas pada saat ada item yang di pilih
     */
    labelFormatter: (lookup: CommonCommunicationData.CommonLookupValue) => string | JSX.Element;
}
export interface BaseSearchableComboBoxMultipleSelectedLabelState { }
/**
 * untuk drop down label dari data selected item
 */
export class BaseSearchableComboBoxMultipleSelectedLabel extends BaseHtmlComponent<BaseSearchableComboBoxMultipleSelectedLabelProps, BaseSearchableComboBoxMultipleSelectedLabelState> {
    /**
     * field pada props untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_PROPS: string[] = ['value', 'versioner' , 'readonlyState'];
    /**
     * field yang di compare pada state untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_STATE: string[] = [];

    constructor(props: BaseSearchableComboBoxMultipleSelectedLabelProps) {
        super(props);
        this.state = {};
    }
    shouldComponentUpdate(nextProps: BaseSearchableComboBoxMultipleSelectedLabelProps, nextState: BaseSearchableComboBoxMultipleSelectedLabelState): boolean {
        if (this.compareForShouldComponentUpdateStateOrProp(BaseSearchableComboBoxMultipleSelectedLabel.FIELD_COMPARED_PROPS, this.props, nextProps)) {
            return true;
        }
        if (this.compareForShouldComponentUpdateStateOrProp(BaseSearchableComboBoxMultipleSelectedLabel.FIELD_COMPARED_STATE, this.state, nextState)) {
            return true;
        }
        return false;
    }
    render(): JSX.Element {
        let lookupData: CommonCommunicationData.CommonLookupValue = (null)!;
        if (!isNull(this.props.lookupContainer[this.props.lovId])) {
            for (let d of this.props.lookupContainer[this.props.lovId]) {
                if ((d.detailCode + '') === (this.props.value + '')) {
                    lookupData = d;
                    break;
                }
            }
        }
        let cnt: any = isNull(lookupData) ? this.props.value : this.props.labelFormatter(lookupData);
        return (
        <li className='select2-selection__choice' title={JSON.stringify(lookupData)}>
            {this.renderCloseButton()}
            {cnt}
        </li>
        );
    }

    protected renderCloseButton(): JSX.Element {
        if (this.props.readonlyState) {
            return <input type='hidden' />;
        }
        return (
        <span 
            className='select2-selection__choice__remove' 
            role='presentation' 
            onClick={(evt: any) => {
                if (!isNull(evt.preventDefault)) {
                    evt.preventDefault();
                }
                if (!isNull(evt.stopPropagation)) {
                    evt.stopPropagation();
                }
                this.props.onRemoveItemClick(this.props.value);
            }}
        >x
        </span>);
    }
}