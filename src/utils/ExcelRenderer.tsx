import * as XLSX from 'xlsx';

interface ColumnObj {
    name: string,
    key: number
}

interface ExcelRendererCallbackResp {
    rows: unknown[],
    cols: Array<ColumnObj>[]
}

type ExcelRendererCallback = (err: Error | null, resp: ExcelRendererCallbackResp) => void;

/**
 * Adapting react-excel-renderer to read multiple sheets.
 * @param file
 * @param callback
 * @constructor
 * @link Original Library - https://github.com/ashishd751/react-excel-renderer/tree/master
 */
export function ExcelRenderer(file: File, callback: ExcelRendererCallback) {
    console.log('file', file);
    console.log('callback', callback);
    return new Promise(function(resolve, reject) {
        if (reject) {
            console.log('Rejected: ', reject);
        }
        const reader = new FileReader();
        const rABS = !!reader.readAsBinaryString;
        reader.onload = function(e) {
            /* Parse data */
            const bstr = e.target?.result;
            const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });

            // All sheet names, for debugging
            console.log('wb.SheetNames', wb.SheetNames);
            // TODO: Make it so sheet names get looped over
            // wil need to loop through and then update the data object to return a few things

            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            /* Convert array of arrays */
            const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
            const cols = ws["!ref"] ? make_cols(ws["!ref"]) : { name: 'null', key: 0};

            const data = { rows: json, cols: cols };

            resolve(data);
            console.log('data', data);
            return callback(null, data);
        };
        if (file && rABS) reader.readAsBinaryString(file);
        else reader.readAsArrayBuffer(file);
    });
}

function make_cols(refstr: string) {
    const o = [],
        C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (let i = 0; i < C; ++i) {
        o[i] = { name: XLSX.utils.encode_col(i), key: i };
    }
    return o;
}