import {useState, useEffect, createRef, SyntheticEvent} from 'react'
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

    const askForColumn = (resp) => {
        console.log('askForColumn');
        const test = window.prompt('column?');
        console.log('test', test);
        console.log('resp', resp);
        console.log('resp[0]', resp[0]);
        console.log('resp[0].cols', resp[0].cols);
        const colObj = resp[0].cols.find((col) => col.name === test);
        console.log('colObj', colObj);
        const colKey = colObj.key;
        const rowObj = resp[0].rows[5][colKey];
        // for testing, use E
        console.log('rowObj', rowObj);
    }

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
                askForColumn(resp);
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
