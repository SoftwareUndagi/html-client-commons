import { BaseSearchableComboBoxMultiple , BaseSearchableComboBoxMultipleProps , BaseSearchableComboBoxMultipleState } from './BaseSearchableComboBoxMultiple';

export interface SearchableComboBoxMultipleProps extends BaseSearchableComboBoxMultipleProps {}
export interface SearchableComboBoxMultipleState extends BaseSearchableComboBoxMultipleState {}

/**
 * searchable combo box multiple
 */
export class SearchableComboBoxMultiple extends BaseSearchableComboBoxMultiple<SearchableComboBoxMultipleProps, SearchableComboBoxMultipleState> {

    generateDefaultState(): SearchableComboBoxMultipleState {
        return {
            dropDownShowed : 'none'  , 
            valueHaveSetted : false , 
            valueLookups : {} , 
            values : [] 
        }    ;
    }

    render () {
        return this.renderNormalSelector(); 
    }

} 