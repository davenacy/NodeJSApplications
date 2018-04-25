'use strict';

const HttpClient = require('node-rest-client').Client;

// This should point to some commerce backend URL to GET product
const url = 'http://isns-dps.com:1512/rest/V1.0/list/StructureGroup/byStructure?pageSize=-1&structure=Sample%20Data%20Home%20Improvement&fields=StructureGroup.Identifier,StructureGroupLang.Name(EN),StructureGroupLang.Description(EN),StructureGroup.ParentIdentifier';
// const url = 'http://localhost';
// after change

let sampleProductData = {
    pid: '123',
    name: 'A simple name',
    price: {
        currencyCode: 'USD',
        value: 10
    }
}

function main(args) {

    var options_auth = { user: "rest", password: "Heiler33!" };

    let httpClient = new HttpClient( options_auth);
    
    return new Promise((resolve, reject) => {
        // httpClient.get(url + args.id, function (data, response) {
        
        console.log(url);
        httpClient.get(url, function(data, response) {
            console.log(JSON.stringify(data, null, 2));
            return resolve(buildResponse(data));
        }).on('error', function (err) {
            // To have this example working even without a valid URL, we simulate some "response" here
            console.log(err)    
            return resolve(buildResponse(sampleProductData));
        });
    });
}

function buildResponse(backendProduct) {
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: mapProduct(backendProduct)
    };
}

/**
 * Example conversion of a commerce backend product into a CIF product
 * 
 * @param backendProduct The JSON product data coming from the commerce system backend.
 * @returns a CIF product.
 */
function mapProduct(backendProduct) {
    
    if( backendProduct.totalSize !== 0 ) {
        let response = {};
        let results = [];
        response.offset = 0;
        response.count = backendProduct.rowCount;
        response.total = backendProduct.totalSize;
        backendProduct.rows.forEach( (row,i) => {
            let parentCategories = [];
            let category = {};
            let parentCategory = {};
            category.id = row.values[0];
            category.name = {};
            category.name.en = row.values[1];
            category.description = {};
            category.description.en = row.values[2];
            
            // parent categories can return an array
            parentCategory.id = row.values[3];
            parentCategories.push( parentCategory);
            category.parentCategories = parentCategories;
            
            results.push(category);
        });
        response.results = results;
        return response;
    } else {
        return {
          "count": backendProduct.rowSize  
        };
    }
}

module.exports.main = main;

// uncomment out the following line to run this locally using "node getCategories.js
// main().then(res => console.log(JSON.stringify(res, null, 2))).catch(err => console.log(err));