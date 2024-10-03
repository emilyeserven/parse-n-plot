import {useState, useEffect, createRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import * as parser from 'parse-address';
import * as zipcodes from 'zipcodes';
import './App.css'
import {ColumnObj, ExcelRenderer, OutTable, SheetObj} from './utils/ExcelRenderer';

function App() {
    const [count, setCount] = useState(0)

    const [isOpen, setIsOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isFormInvalid, setIsFormInvalid] = useState(false);
    const [wbData, setWbData] = useState<SheetObj[] | null>(null);
    const [demoRows, setDemoRows] = useState<unknown[] | null>(null);
    const [demoCols, setDemoCols] = useState<ColumnObj[] | null>(null);
    const [cityCounts, setCityCounts] = useState();
    const [cols, setCols] = useState<[]>([]);
    const [uploadedFileName, setUploadedFileName] = useState('');

    const fileInput = createRef();


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
        console.log('fileObj', fileObj);

        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('resp', resp);
                setWbData(resp);
            }
        });
    }

    const fileHandler = (event) => {
        console.log('event', event);
        if(event.target.files.length){
            const fileObj = event.target.files[0];
            const fileName = fileObj.name;


            //check for file extension and pass only if it is .xlsx and display error message otherwise
            if(fileName.slice(fileName.lastIndexOf('.')+1) === ("xlsx" || "xls")){
                setUploadedFileName(fileName);
                setIsFormInvalid(false);
                renderFile(fileObj);
            } else {
                setIsFormInvalid(true);
                setUploadedFileName('');
            }
        }
    }

    const handleColButton = (col) => {
        const targetCol = col.name;
        console.log('targetCol', targetCol);
        if (targetCol && wbData) {

            const chosenColumn = wbData[0].cols.find((col) => col.name === targetCol);
            console.log('chosenColumn', chosenColumn);
            const columnIndex = chosenColumn?.key - 1;
            console.log('columnIndex', columnIndex);
            const allRowsArray: unknown[] = [];

            // For every sheet in the workbook, add the rows to the allRowsArray
            wbData.forEach(sheet => {
                sheet.rows.forEach((row) => allRowsArray.push(row));
            })
            console.log('rowArray', allRowsArray);
            const columnContentsArray: (string | undefined)[] = [];

            // Loop through each row and add the chosen column to
            allRowsArray.forEach((row) => {
                if (row[columnIndex]) {
                    columnContentsArray.push(row[columnIndex]);
                }
            });
            console.log('columnContentsArray', columnContentsArray);

            // for testing, use E
            // Remove the undefined results
            const cleanResults = columnContentsArray.filter((colContents) => colContents !== undefined);
            console.log('cleanResults', cleanResults);

            // Will need an array with only addresses
            const parsedAddresses = [];
            cleanResults.forEach((item) => {
                parsedAddresses.push(parser.parseLocation(item));
            });
            console.log('parsedAddresses', parsedAddresses);

            const cleanedAddresses = parsedAddresses.filter((item) => item.city !== undefined && item.state !== undefined);
            console.log('cleanedAddresses', cleanedAddresses);

            const cityCount = {};
            cleanedAddresses.forEach((item) => {
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
            /*
            const parsedZipcodes = [];
            cleanedAddresses.forEach((address) => {
                const zipcode = zipcodes.lookupByName(address.city, address.state);
                parsedZipcodes.push(zipcode);
            })
            console.log('parsedZipcodes', parsedZipcodes);
            */
        }
    }

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    const openFileBrowser = () => {
        fileInput.current.click();
    }

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>

                <button color="info" style={{color: "white", zIndex: 0}} onClick={() => { openFileBrowser()}}><i className="cui-file"></i> Browse&hellip;</button>
                <input type="file" hidden onChange={fileHandler} ref={fileInput}
                       onClick={(event) => {
                           event.target.value = null
                       }} style={{"padding": "10px"}}/>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
            <div>
                { dataLoaded && (
                    <OutTable
                        data={demoRows}
                        columns={demoCols}
                        tableClassName='Table'
                        tableHeaderRowClass='header'
                    />
                )}
            </div>
            <div>
                { (demoCols) && (
                    <>
                        {demoCols.map((col) => (
                            <button
                                onClick={() => handleColButton(col)}
                                className={'mx-2'}
                                key={col.key}
                            >
                                {col.name}
                            </button>
                        ))}
                    </>
                )}
            </div>
            <div>
                { (cityCounts) && (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>City</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                            {Object.keys(cityCounts).map((city) => (
                                <tr key={cityCounts[city].name}>
                                    <td>{cityCounts[city].name}</td>
                                    <td>{cityCounts[city].count}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </>
    )
}

export default App
