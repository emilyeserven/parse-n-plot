import {useState, useEffect, createRef} from 'react'
// @ts-expect-error - Outside module, can't do anything about it.
import * as parser from 'parse-address';
import './App.css'
import {ColumnObj, ExcelRenderer, OutTable, SheetObj} from './utils/ExcelRenderer';

interface AddressObj {
    number?: string,
    prefix?: string,
    street?: string,
    type?: string,
    city?: string,
    state?: string,
    zip?: string
}

interface City {
        name: string,
        count: number
}

interface CityObj {
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

    const fileInput = createRef();


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

    const fileHandler = (event) => {
        if(event.target.files.length){
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

        if (selectedColName && wbData) {
            const chosenColumn = wbData[0].cols.find((col) => col.name === selectedColName);
            const columnIndex = chosenColumn?.key ? chosenColumn.key - 1 : 0;
            const allRowsArray: unknown[] = [];

            // For every sheet in the workbook, add the rows to the allRowsArray
            wbData.forEach(sheet => {
                sheet.rows.forEach((row) => row && allRowsArray.push(row));
            })
            const columnContentsArray: (string | undefined)[] = [];

            // Loop through each row and add the chosen column to
            allRowsArray.forEach((row) => {
                if (row[columnIndex]) {
                    columnContentsArray.push(row[columnIndex]);
                }
            });

            // Remove the undefined results
            const cleanResults = columnContentsArray.filter((colContents) => colContents !== undefined);

            // Parse all cleaned results as addresses
            const parsedAddresses: AddressObj[] = [];
            cleanResults.forEach((item) => {
                const parsedLocation = parser.parseLocation(item);
                const isCityAndStateExist = parsedLocation.city !== undefined && parsedLocation.state !== undefined;

                if (isCityAndStateExist) {
                    parsedAddresses.push(parsedLocation);
                }
            });

            // Make an object to count each individual city
            const cityCount: CityObj = {};
            parsedAddresses.forEach((item) => {
                const cityStateString = `${item.city}, ${item.state}`;
                if (cityCount[cityStateString]) {
                    cityCount[cityStateString].count = cityCount[cityStateString].count + 1;
                } else {
                    cityCount[cityStateString] = {
                        name: cityStateString,
                        count: 1
                    }
                }
            });
            console.log('cityCount', cityCount);
            setCityCounts(cityCount);
            setTotalCount(parsedAddresses.length);
        }
    }

    const openFileBrowser = () => {
        fileInput.current.click();
    }

    return (
        <>
            <div className="">
                <h1 className='text-4xl mb-4'>Parse n' Plot</h1>
                <h2 className='text-2xl mb-2'>1: Upload a file</h2>
                <button color="info" style={{color: "white", zIndex: 0}} onClick={() => { openFileBrowser()}}><i className="cui-file"></i> {wbData === null ? 'Browse' : 'Reupload'}</button>
                <input type="file" hidden onChange={fileHandler} ref={fileInput}
                       onClick={(event) => {
                           event.target.value = null
                       }} style={{"padding": "10px"}}/>
            </div>
            <div>
                { (dataLoaded && demoRows && demoCols) && (
                    <>
                        <h2 className='text-2xl mt-6 mb-2'>2: Check the preview of the spreadsheet.</h2>
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
                {(demoCols) && (
                    <>
                        <h2 className='text-2xl mt-6 mb-2'>3: Select the column with addresses.</h2>
                        {demoCols.map((col) => (
                            <button
                                onClick={() => handleColButton(col)}
                                className={`mx-2 ${col.name === usedCol ? 'bg-slate-200 text-black' : ''}`}
                                key={col.key}
                            >
                                {col.name}
                            </button>
                        ))}
                    </>
                )}
            </div>
            <div>
                { (Object.getOwnPropertyNames(cityCounts).length > 0) ? (
                    <>
                        <h2 className='text-2xl mt-8 mb-2'>4: Review the results!</h2>
                        Total: {totalCount}
                        <table>
                            <thead>
                            <tr>
                                <th>City</th>
                                <th>Count</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.getOwnPropertyNames(cityCounts).map((city) => (
                                <tr key={cityCounts[city].name}>
                                    <td>{cityCounts[city].name}</td>
                                    <td>{cityCounts[city].count}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                ) : (
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
