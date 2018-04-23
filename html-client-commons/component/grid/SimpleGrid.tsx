import * as React from "react" ;
import { ObjectUtils } from '../../utils/index'; 
import { CommonCommunicationData , isNull } from 'core-client-commons/index';
import { GridColumnProps , GridColumnCustomFormatterParameter, GridDataAlign } from './SimpleGridMetadata';
import { BaseGrid , BaseGridProps, BaseGridState } from  './BaseGrid';

export interface SimpleGridProps<DATA> extends BaseGridProps<DATA> {

    /**
     * column definitions
     */
     columnDefinitions: GridColumnProps<DATA>[] ; 

    /**
     * index data pertama di mulai dari posisi berapa. ini tergantung pada paging
     */
    startRowNumber: number ; 
    /**
     * data untuk di render dalam grid
     */
    data: DATA[];
    /**
     * generator initial state untuk row(untuk keperluan sub row). misal anda perlu expand collapse panel
     * @param data data untuk di buatkan state nya
     * @param rowIndex index dari row untuk di render
     */
    generatorInitialRowStateData ?: (data: DATA , rowIndex: number ) => {[id: string]: any } ; 
    /**
     * ini untuk grid normal
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel ?: ( data: DATA , rowIndex: number , columnDefinitions: GridColumnProps<DATA>[] , rowStateContainer: {[id: string]: any}) => JSX.Element[] ; 

}
export interface SimpleGridState<DATA> extends BaseGridState<DATA> {
    /**
     * state untuk row
     */
    rowStateContainer: {[id: string]: any }[] ; 
}
/**
 * simple grid
 * TODO : perbaiki masalah rowState untuk sub row
 */
export class SimpleGrid<DATA> extends BaseGrid<DATA , SimpleGridProps<DATA>  , SimpleGridState<DATA> >  {
    constructor(props: SimpleGridProps<DATA>) {
        super(props);
        this.state = {
            rowStateContainer : [], 
            columnDefinitions : []
        };
    }
    /**
     * meminta lookup container yang di pakai grid
     */
     getLookupContainer (): {[id: string]: CommonCommunicationData.CommonLookupValue[]} {
         return null! ; 
     }
    /**
     * membaca data grid
     */
    getGridData (): DATA[]  {
        return this.props.data ; 
    }  

    /**
     * generate sub panel row. di bawah data. ini format table bebas
     * @param data grid data
     * @param rowIndex index dari data
     */
    populateSubRow (data: DATA , rowIndex: number ): JSX.Element[]  {
        if ( isNull(this.props.generatorAfterRowDataPanel)) {
            return null!; 
        }
        return this.props.generatorAfterRowDataPanel!(data , rowIndex , this.props.columnDefinitions , this.getGridRowState(rowIndex));
    }
    /**
     * membaca state untuk di ambil
     * @param rowIndex index dari row yang di ambil
     */
    getGridRowState ( rowIndex: number ): {[id: string]: any } {
        if ( rowIndex < 0 &&  rowIndex >= this.state.rowStateContainer.length ) {
            return null !; 
        }
        return this.state.rowStateContainer[rowIndex];
    }

    componentWillMount() {
        let swapState: SimpleGridState<DATA> = this.state ; 
        let appendRowNumberColumn: boolean = true ; 
        if ( !isNull(this.props.appendRowNumberColumn)) {
            appendRowNumberColumn = this.props.appendRowNumberColumn!; 
        }
        this.populateRowStateData(this.props.data , this.state);
        if ( appendRowNumberColumn) {
            let renderer:  (parameter: GridColumnCustomFormatterParameter<DATA> ) => JSX.Element = (parameter: GridColumnCustomFormatterParameter<DATA> )  => {
                // let data: DATA  = parameter.data ; 
                let rowIndex: number = parameter.rowIndex ; 
                if ( !isNull(this.props.rowNumberWidth)) {
                    return (
                    <td 
                        style={{width: this.props.rowNumberWidth}}  
                        key={'row_number_' + rowIndex}
                    >{this.props.startRowNumber + rowIndex + 1}
                    </td>
                    );
                }
                return <td key={'row_number_' + rowIndex}>{this.props.startRowNumber + rowIndex + 1}</td>;
            };
            let defRoNumb: GridColumnProps<DATA> = {
                label : 'No' , 
                gridHeaderCssname : 'center' , 
                fieldName : null! ,
                align : GridDataAlign.right , 
                customDataFormatter : renderer
            }; 
            swapState.columnDefinitions = [defRoNumb];
        }
        if ( !isNull(this.props.columnDefinitions) && this.props.columnDefinitions.length > 0) {
            swapState.columnDefinitions.push(...this.props.columnDefinitions);
        }
        
    }
    componentWillUpdate(nextProps: SimpleGridProps<DATA> , nextState: SimpleGridState<DATA>) {
        if ( ObjectUtils.compareFieldsArray(this.props.data , nextProps.data , null!) ) {
            this.populateRowStateData(nextProps.data , nextState);
        }
    }
    /**
     * populate state dari row
     * @param data data untuk basis render data
     * @param targetState 
     */
    private populateRowStateData ( data: DATA[] ,  targetState: SimpleGridState<DATA>  ) {
        targetState.rowStateContainer = [] ; 
        let gen:  (data: DATA , rowIndex: number ) => any = !isNull(this.props.generatorInitialRowStateData) ? this.props.generatorInitialRowStateData! :  (dataInner: DATA , rowIndexInner: number ) => {
            return {}; 
        };
        if ( !isNull(data)) {
            for ( let i = 0 ; i < data.length ; i++) {
                targetState.rowStateContainer.push(gen(data[i] , i)) ;        
            }
        }
    }
}
