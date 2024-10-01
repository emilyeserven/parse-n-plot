import { useState, useEffect, createRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ExcelRenderer } from 'react-excel-renderer';
import { read, utils } from 'xlsx';

function App() {
    const [count, setCount] = useState(0)
    const [pres, setPres] = useState();

    const [isOpen, setIsOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isFormInvalid, setIsFormInvalid] = useState(false);
    const [rows, setRows] = useState<[]>([]);
    const [cols, setCols] = useState<[]>([]);
    const [uploadedFileName, setUploadedFileName] = useState('');

    const fileInput = createRef();

    const renderFile = (fileObj) => {
        console.log('fileObj', fileObj);

        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('resp', resp);
                setDataLoaded(true);
                setCols(resp.cols);
                setRows(resp.rows);
            }
        });
    }

    const fileHandler　= (event) => {
        if(event.target.files.length){
            const fileObj = event.target.files[0];
            const fileName = fileObj.name;


            //check for file extension and pass only if it is .xlsx and display error message otherwise
            if(fileName.slice(fileName.lastIndexOf('.')+1) === "xlsx"){
                setUploadedFileName(fileName);
                setIsFormInvalid(false);
                renderFile(fileObj)
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

/*
    /* Fetch and update the state once
    useEffect(() => { (async() => {
        /* Download from https://docs.sheetjs.com/pres.numbers
        const f = await fetch(null);
        const ab = await f.arrayBuffer();

        /* parse
        const wb = read(ab);

        /* generate array of presidents from the first worksheet
        const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
        const data: [] = utils.sheet_to_json(ws); // generate objects

        /* update state
        setPres(data); // update state
        console.log('pres', pres);
    })(); }, []);

    useEffect(() => {
        if (pres) {
            pres.map(row => {
                console.log('row', row);
                console.log('row empty', row.__EMPTY_3);
            });
        }
    }, [pres]);


    console.log('pres', pres);

 */

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
