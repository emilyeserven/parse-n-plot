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

// For every sheet in the workbook, add the rows to the allRowsArray
const getAllTheRows = ({data}) => {
    const allRowsArray = [];

    data.forEach(sheet => {
        sheet.rows.forEach((row) => row && allRowsArray.push(row));
    })

    return allRowsArray;
}

// Loop through each row and add the chosen column to array
const getChosenColumnFromRows = ({allRowsArray, columnIndex}) => {
    const columnContentsArray = [];

    allRowsArray.forEach((row) => {
        if (row[columnIndex]) {
            columnContentsArray.push(row[columnIndex]);
        }
    });

    return columnContentsArray;
}

// Remove the undefined results
const getCleanedList = ({arrayToClean}) => {
    return arrayToClean.filter((colContents) => colContents !== undefined)

}

// Parse all cleaned results as addresses
const getParsedAddressList = ({columnContentsArray}) => {
    const parsedAddressList = [];

    const cleanResults = getCleanedList({arrayToClean: columnContentsArray});

    cleanResults.forEach((item) => {
        const parsedLocation = parser.parseLocation(item);
        const isCityAndStateExist = parsedLocation.city !== undefined && parsedLocation.state !== undefined;

        if (isCityAndStateExist) {
            parsedAddressList.push(parsedLocation);
        }
    });
    return parsedAddressList;
}

// Make an object to count each individual city
const getCitiesObject = ({parsedAddressList}) => {
    const cityObject = {};

    parsedAddressList.forEach((item) => {
        const cityStateString = `${item.city}, ${item.state}`;
        if (cityObject[cityStateString]) {
            cityObject[cityStateString].count = cityObject[cityStateString].count + 1;
        } else {
            cityObject[cityStateString] = {
                name: cityStateString,
                count: 1,
                percent: 0
            }
        }
    });

    return cityObject;
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
    const allRowsArray = getAllTheRows({data: wbData});
    const columnContentsArray = getChosenColumnFromRows({allRowsArray, columnIndex});
    const parsedAddressList: AddressObj[] = getParsedAddressList({columnContentsArray});
    const cityCount: CityObj = getCitiesObject({parsedAddressList});

    returnData.cityTotal = parsedAddressList.length;

    for (const city in cityCount) {
        cityCount[city].percent = cityCount[city].count / returnData.cityTotal;
    }

    returnData.cityCount = cityCount;

    return returnData;
}