import {useState, useEffect, createRef} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {ExcelRenderer, SheetObj} from './utils/ExcelRenderer';

function App() {
    const [count, setCount] = useState(0)

    const [isOpen, setIsOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isFormInvalid, setIsFormInvalid] = useState(false);
    const [wbData, setWbData] = useState<SheetObj[] | null>(null);
    const [cols, setCols] = useState<[]>([]);
    const [uploadedFileName, setUploadedFileName] = useState('');

    const fileInput = createRef();


    useEffect(() => {
        if (wbData !== null) {
            const columnToUse = window.prompt('column?');

            const chosenColumn = wbData[0].cols.find((col) => col.name === columnToUse);
            const columnIndex = chosenColumn?.key;
            const allRowsArray: unknown[] = [];

            // For every sheet in the workbook, add the rows to the allRowsArray
            wbData.forEach(sheet => {
                sheet.rows.forEach((row) => allRowsArray.push(row));
            })
            console.log('rowArray', allRowsArray);
            const columnContentsArray: (string|undefined)[] = [];

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
                setDataLoaded(true);
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
        </>
    )
}

export default App
