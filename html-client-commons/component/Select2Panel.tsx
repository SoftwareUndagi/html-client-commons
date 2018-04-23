import { BaseSearchableComboBox ,  BaseSearchableComboBoxProps , BaseSearchableComboBoxState } from './BaseSearchableComboBox'; 

export interface Select2PanelProps extends BaseSearchableComboBoxProps {}

export interface Select2PanelState extends BaseSearchableComboBoxState {}

export class Select2Panel extends BaseSearchableComboBox<BaseSearchableComboBoxProps, BaseSearchableComboBoxState> {
    generateDefaultState(): BaseSearchableComboBoxState {
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