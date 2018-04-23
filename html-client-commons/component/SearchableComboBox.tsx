import { BaseSearchableComboBox ,  BaseSearchableComboBoxProps , BaseSearchableComboBoxState } from './BaseSearchableComboBox';
export interface SearchableComboBoxProps extends BaseSearchableComboBoxProps {}
export interface SearchableComboBoxState extends BaseSearchableComboBoxState {}
/**
 * tiruan select 2 . di bangun dengan total react
 */
export class SearchableComboBox extends BaseSearchableComboBox<SearchableComboBoxProps, SearchableComboBoxState> {
    generateDefaultState(): SearchableComboBoxState {
        let s: any = null ; 
        return {
            value : s , 
            valueLookup : s , 
            valueRendered : s , 
            lookupValueNotFound : false , 
            valueHaveSetted : false , 
            dropDownShowed : 'none'
        }; 
    }

}