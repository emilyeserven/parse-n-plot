import {useState, useEffect, createRef} from 'react'

import './App.css'
import {ColumnObj, ExcelRenderer, OutTable, SheetObj} from './utils/ExcelRenderer';
import addressParser from "./utils/addressParser.ts";

interface City {
        name: string,
        count: number,
        percent: number
}

export interface CityObj {
    [key: string]: City
}

function App() {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [wbData, setWbData] = useState<SheetObj[] | null>(null);
    const [demoRows, setDemoRows] = useState<unknown[] | null>(null);
    const [demoCols, setDemoCols] = useState<ColumnObj[] | null>(null);
    const [cityCounts, setCityCounts] = useState<CityObj | null>();
    const [totalCount, setTotalCount] = useState(0);
    const [usedCol, setUsedCol] = useState<string | null>(null);

    const fileInput: React.RefObject<HTMLInputElement> = createRef();
    const isCityCountsHasProperties = cityCounts && Object.getOwnPropertyNames(cityCounts).length !== 0;
    const isOutTableCanBeDisplayed = dataLoaded && demoRows && demoCols;


    // Once we have the workbook data, we get the first 10 rows and columns for a preview.
    useEffect(() => {
        if (wbData !== null) {
            const firstSheetRows = wbData[0].rows.slice(0,9);
            setDemoRows(firstSheetRows);

            const firstSheetCols = wbData[0].cols.slice(0,9);
            setDemoCols(firstSheetCols);

            setDataLoaded(true);
        }
    }, [wbData]);

    const renderFile = (fileObj: File) => {
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
            }
            else {
                setWbData(resp);
            }
        });
    }

    const fileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.files?.length){
            const fileObj = event.target.files[0];
            const fileName = fileObj.name;


            //check for file extension and pass only if it is .xlsx and display error message otherwise
            if(fileName.slice(fileName.lastIndexOf('.')+1) === ("xlsx" || "xls")){
                renderFile(fileObj);
            }
        }
    }

    // Parses address info once the button to identify the column to use is clicked.
    const handleColButton = (col: ColumnObj) => {
        const selectedColName = col.name;
        setUsedCol(selectedColName);
        const isColHasNameAndWbHasData = selectedColName && wbData;

        if (isColHasNameAndWbHasData) {
            const parsedAddressData = addressParser(wbData, selectedColName);

            setCityCounts(parsedAddressData.cityCount);
            setTotalCount(parsedAddressData.cityTotal);
        }
    }

    const clearAll = () => {
        setDataLoaded(false);
        setWbData(null);
        setDemoRows(null);
        setDemoCols(null);
        setCityCounts(null);
        setTotalCount(0);
        setUsedCol(null);
    }

    const openFileBrowser = () => {
        fileInput.current?.click();
    }

    return (
        <>
            <div className="">
                <h1 className='text-4xl mb-2'>Parse n' Plot</h1>
                <p className='text-3xl mb-8'><b>Parse</b> an Excel file a<b>n</b>d then <b>Plot</b> the addresses on a map!</p>
                <h2 className='text-2xl mb-2'>1: Upload a file</h2>
                <button className={`${wbData === null ? 'bg-slate-200 text-black' : 'bg-gray-600 text-white'}`}
                        onClick={() => {
                            openFileBrowser()
                        }}><i className="cui-file"></i> {wbData === null ? 'Browse' : 'Reupload'}</button>
                <input type="file" hidden onChange={fileHandler} ref={fileInput}
                       onClick={(event) => {
                           const theTarget = event.target as HTMLInputElement;
                           theTarget.value = '';
                       }} style={{"padding": "10px"}}/>
                <button className={`${wbData !== null ? 'bg-slate-200 text-black ml-4' : 'bg-gray-600 text-white ml-4 italic cursor-default border-0'}`}
                        onClick={clearAll}><i className="cui-file"></i> {wbData !== null ? 'Clear All' : 'Nothing to Clear'}</button>

            </div>
            <div>
                {isOutTableCanBeDisplayed && (
                    <>
                        <h2 className='text-2xl mt-10 mb-2'>2: Check the preview of the spreadsheet.</h2>
                        <h3 className='text-1xl mt-2 mb-2'>You may also upload a different file above.</h3>
                        <OutTable
                            data={demoRows}
                            columns={demoCols}
                            tableClassName='Table'
                            tableHeaderRowClass='header'
                        />
                    </>
                )}
            </div>
            <div>
                {demoCols && (
                    <>
                        <h2 className='text-2xl mt-10 mb-2'>3: Select the column with addresses.</h2>
                        {demoCols.map((col) => (
                            <button
                                onClick={() => handleColButton(col)}
                                className={`mx-2 ${col.name === usedCol ? 'bg-slate-200 text-black' : 'border-white border-2'}`}
                                key={col.key}
                            >
                                {col.name}
                            </button>
                        ))}
                    </>
                )}
            </div>
            <div>
                { usedCol && isCityCountsHasProperties && (
                    <>
                        <h2 className='text-2xl mt-10 mb-2'>4: Review the results!</h2>
                        <h3 className='text-1xl mt-2 mb-4'>(FYI, there were {totalCount} addresses total.)</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>City</th>
                                <th>Count</th>
                                <th>% of Jobs</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.getOwnPropertyNames(cityCounts).map((city) => (
                                <tr key={cityCounts[city].name}>
                                    <td className='px-6 py-2 border-white border-2 border-solid'>{cityCounts[city].name}</td>
                                    <td className='px-6 py-2 border-white border-2 border-solid'>{cityCounts[city].count}</td>
                                    <td className='px-6 py-2 border-white border-2 border-solid'>{(cityCounts[city].percent * 100).toFixed(2)}%</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                )}
                {usedCol !== null && !isCityCountsHasProperties && (
                    <>
                        <h2 className='text-2xl mt-8 mb-2'>Hmmm... There aren't any addresses in this column.</h2>
                        <h3 className='text-1xl mt-2 mb-2'>Try another!</h3>
                    </>
                )}
            </div>
        </>
    )
}

export default App
