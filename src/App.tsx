import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import payroll from './assets/payroll.xlsx'
import viteLogo from '/vite.svg'
import './App.css'
import { read, utils } from 'xlsx';

function App() {
    const [count, setCount] = useState(0)
    const [pres, setPres] = useState();

    /* Fetch and update the state once */
    useEffect(() => { (async() => {
        /* Download from https://docs.sheetjs.com/pres.numbers */
        const f = await fetch(payroll);
        const ab = await f.arrayBuffer();

        /* parse */
        const wb = read(ab);

        /* generate array of presidents from the first worksheet */
        const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
        const data: [] = utils.sheet_to_json(ws); // generate objects

        /* update state */
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
