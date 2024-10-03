// @ts-expect-error - Outside module, can't do anything about it.
import * as parser from 'parse-address';
import {CityObj} from "../App.tsx";
import {SheetObj} from "./ExcelRenderer.tsx";

interface AddressObj {
    number?: string,
    prefix?: string,
    street?: string,
    type?: string,
    city?: string,
    state?: string,
    zip?: string
}

export default function addressParser(
    wbData: SheetObj[],
    selectedColName: string
) {
    const returnData = {
        cityCount: {},
        cityTotal: 0
    };
    const chosenColumn = wbData[0].cols.find((col) => col.name === selectedColName);
    const columnIndex = chosenColumn?.key ? chosenColumn.key - 1 : 0;

    // Set up all the arrays and objects
    const allRowsArray: unknown[] = [];
    const columnContentsArray: (string | undefined)[] = [];
    const parsedAddressList: AddressObj[] = [];
    const cityCount: CityObj = {};

    // For every sheet in the workbook, add the rows to the allRowsArray
    wbData.forEach(sheet => {
        sheet.rows.forEach((row) => row && allRowsArray.push(row));
    })

    // Loop through each row and add the chosen column to array
    allRowsArray.forEach((row) => {
        if (row[columnIndex]) {
            columnContentsArray.push(row[columnIndex]);
        }
    });

    // Remove the undefined results
    const cleanResults = columnContentsArray.filter((colContents) => colContents !== undefined);

    // Parse all cleaned results as addresses
    cleanResults.forEach((item) => {
        const parsedLocation = parser.parseLocation(item);
        const isCityAndStateExist = parsedLocation.city !== undefined && parsedLocation.state !== undefined;

        if (isCityAndStateExist) {
            parsedAddressList.push(parsedLocation);
        }
    });

    // Make an object to count each individual city
    parsedAddressList.forEach((item) => {
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

    returnData.cityCount = cityCount;
    returnData.cityTotal = parsedAddressList.length;

    return returnData;
}