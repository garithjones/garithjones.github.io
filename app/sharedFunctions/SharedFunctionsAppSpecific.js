angular.module('app').factory('SharedFunctionsAppSpecific', ['$rootScope', '$resource', '$q', 'SharedFactory', function SharedFunctionsAppSpecific($rootScope, $resource, $q, SharedFactory) {
    console.log("Shared Functions - App Specific");

    var factory = {
        debounce: debounceInternal,
        QueryBuilderWatch: QueryBuilderWatchInternal,
        aggrid2sql: aggrid2sqlInternal,
        test: testInternal,
        RecalcStockFromLinesIn: RecalcStockFromLinesInInternal,
        convertFromAvgWtToAvgLen: convertFromAvgWtToAvgLenInternal,
        convertFromAvgLenToAvgWt: convertFromAvgLenToAvgWtInternal,
        CustomRound: CustomRoundInternal,
        RecalcStockLineInformationFromAvgWt: RecalcStockLineInformationFromAvgWtInternal,
        RecalcStockLineInformationFromAvgLen: RecalcStockLineInformationFromAvgLenInternal,
        RecalcStockLineInformationFromWt: RecalcStockLineInformationFromWtInternal,
        RecalcStockLineInformationFromNum: RecalcStockLineInformationFromNumInternal,
        RecalcStockLineInPercentageContribution: RecalcStockLineInPercentageContributionInternal,
        GenerateUUID: GenerateUUIDInternal,
        GrowStock: GrowStockInternal,
        RecalculateFGR: RecalculateFGRInternal,
        CreateNewImportStock: CreateNewImportStockInternal,
        GetRowNumFromArray: getRowNumFromArray
    };

    function debounceInternal(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };


    function QueryBuilderWatchInternal(newValue, elasticBuilderDatafields) {
        //QueryBuilder2Display FORMATER
        var sp = ' ';
        var bl = '(';
        var br = ')';
        var qu = "'"; //short var, for adding pretty character to query display
        var completeFilterString = '';
        var outputQuery = '';

        for (var a in newValue) { // a=0,1,2,3...
            var field = '';
            var value = '';
            var logic = '';
            var dataField = '';
            var temp = '';
            var operation = '';
            var filterTemp = '';
            for (var b in newValue[a]) { //b= ""term | "not" | "exists" | "missing" | "range" | "terms"
                switch (b) {
                case 'term':
                    logic = ' = ';
                    for (var c in newValue[a][b]) { //"Grade"
                        field = c;
                        value = typeof (newValue[a][b][c]) == 'string' ? newValue[a][b][c] : newValue[a][b][c].toString(); //int type numerals is bad for string usage
                        temp = elasticBuilderDatafields[field].dataField;
                        dataField = temp ? temp : field; //DB column names are ugly, use display names for dropdown, but data names for sql queries
                        filterTemp = dataField + " like ('%" + value + "%')";
                        value = qu + value + qu; //add quotes around, for pretty query display
                    };
                    break;
                case 'not':
                    logic = ' ≠ ';
                    for (var c in newValue[a][b]) { //filter
                        for (var d in newValue[a][b][c]) { //term
                            for (var e in newValue[a][b][c][d]) { //"Grade"
                                field = e;
                                value = typeof (newValue[a][b][c][d][e]) == 'string' ? newValue[a][b][c][d][e] : newValue[a][b][c][d][e].toString(); //int type numerals is bad for string usage\
                                temp = elasticBuilderDatafields[field].dataField;
                                dataField = temp ? temp : field; //DB column names are ugly, use display names for dropdown, but data names for sql queries
                                filterTemp = dataField + " not like ('%" + value + "%')";
                                value = qu + value + qu; //add quotes around, for pretty query display
                            };
                        };
                    };
                    break;
                case 'exists':
                    logic = ' ∃';
                    for (var c in newValue[a][b]) { //field
                        field = newValue[a][b][c];
                        value = '';
                        temp = elasticBuilderDatafields[field].dataField;
                        dataField = temp ? temp : field; //DB column names are ugly, use display names for dropdown, but data names for sql queries
                        filterTemp = dataField + " is not null";
                    };
                    break;
                case 'missing': //'∅'
                    logic = ' ∅';
                    for (var c in newValue[a][b]) { //field
                        field = newValue[a][b][c];
                        value = '';
                        temp = elasticBuilderDatafields[field].dataField;
                        dataField = temp ? temp : field; //DB column names are ugly, use display names for dropdown, but data names for sql queries
                        filterTemp = dataField + " is null";
                    };
                    break;
                case 'range': //'±'
                    logic = ' ± ';
                    for (var c in newValue[a][b]) { //"AvgWt"
                        for (var d in newValue[a][b][c]) { //equals
                            logic = (d == 'equals' ? ' = ' : (d == 'gt' ? ' > ' : (d == 'gte' ? ' ≥ ' : (d == 'lt' ? ' < ' : d == 'lte' ? ' ≤ ' : (d == 'exists' ? ' ∃' : (d == 'notExists' ? ' ∅' : ':')))))); //convert to char
                            field = c;
                            value = (d == 'exists' || d == 'notExists') ? '' : (newValue[a][b][c][d] == undefined ? '' : (typeof (newValue[a][b][c][d]) == 'number' ? newValue[a][b][c][d] : Number(newValue[a][b][c][d]))); //remove 'undefined' being displayed
                            //format for sql query
                            temp = elasticBuilderDatafields[field].dataField;
                            dataField = temp ? temp : field; //DB column names are ugly, use display names for dropdown, but data names for sql queries
                            operation = (d == 'equals' ? ' = ' : (d == 'gt' ? ' > ' : (d == 'gte' ? ' >= ' : (d == 'lt' ? ' < ' : d == 'lte' ? ' <= ' : 'notArith'))));
                            if (operation == 'notArith') { //this is an existintial operation
                                filterTemp = (d == 'exists' ? (dataField + " is not null") : (d == 'notExists') ? (dataField + " is null") : '');
                            } else { //this is arithmetic operation
                                filterTemp = dataField + operation + value;
                            };
                        };
                    };
                    break;
                case 'terms':
                    logic = ' is ';
                    for (var c in newValue[a][b]) { //c="Farm"
                        field = c;
                        temp = elasticBuilderDatafields[field].dataField;
                        dataField = temp ? temp : field; //DB column names are ugly, use display names for dropdown, but data names for sql queries
                        temp = '';
                        for (var d in newValue[a][b][c]) { //d=0,1,2,3...
                            value += (d != 0 ? ' OR ' : '') + '"' + newValue[a][b][c][d] + '"'; //output query
                            temp += (d != 0 ? ' OR ' : '(') + dataField + " = '" + newValue[a][b][c][d] + "'"; //SQL query
                        };
                        filterTemp = temp + ')';
                    };
                    break;
                }
            };
            var outputQueryhold = (value === '' && logic != ' ∃' && logic != ' ∅') ? '' : (bl + field + logic + value + br);
            var outputQuerylogic = (outputQuery != '' && outputQueryhold != '' ? ' AND ' : '');
            outputQuery += outputQuerylogic + outputQueryhold; //adding these inline without variables results in "" empty string...??

            filterTemp = (value === '' && logic != ' ∃' && logic != ' ∅') ? '' : filterTemp;
            logic = ((completeFilterString != '' && filterTemp != '') ? ' AND ' : ''); //dont prepend "AND" to the start of final string
            completeFilterString += logic + filterTemp + ''; // -> build final search string
        };
        var resultObject = {
            outputQuery: outputQuery,
            completeQueryNotApplied: completeFilterString,
        };
        return resultObject;
        //Type Term equal
        //        query[0]
        //            term: Object
        //                Grade Seq: "qwert"

        //Type Term NOT equal
        //        query[0]
        //             not: Object
        //                 filter: Object
        //                    term: Object
        //                        Grade Seq: "qwert"

        //Type Term exists
        //        query[0]
        //             exists: Object
        //                field: "Grade Seq"

        //Type Term NOT exists
        //        query[0]
        //             missing: Object
        //                field: "Grade Seq"

        //Type Number EQ
        //        query[0]
        //            range: Object
        //                Num (In) [ea]: Object
        //                    equals: 544

        //Type Number GT
        //        query[0]
        //            range: Object
        //                Num (In) [ea]: Object
        //                    gt: 544   //X ->  equals gt gte lt lte exists notExists
    }

    function aggrid2sqlInternal(filterModel, completeQueryApplied, elasticBuilderDatafields) {
        var sp = ' ';
        var bl = '(';
        var br = ')';
        var qu = "'"; //short var, for adding pretty character to query display
        var completeFilterString = '';
        var filterParamsDisplayQuery = '';
        for (var a in filterModel) { // a = fieldName
            var tempDQ = ''; //temp display query
            var filterType = '';
            var filterTemp = '';
            var logic = '';
            for (var x in elasticBuilderDatafields) {
                if (elasticBuilderDatafields[x].dataField == a) {
                    var dField = x;
                };
            };
            if (filterModel[a].filter != undefined && filterModel[a].filter != null) { //is Type TEXT/NUMBER
                if (typeof (filterModel[a].filter) == 'string') {
                    filterType = 'string';
                } else if (typeof (filterModel[a].filter) == 'number') {
                    filterType = 'number';
                } else {
                    filterType = 'set';
                };
            } else { //is Type SET
                return 'un-formated filterModel'; //some way of error handeling TODO
            };

            switch (filterType) { //every case ends with a filterTemp, a string piece of the final filter
            case 'string':
                switch (filterModel[a].type) {
                case 1: //contains
                    filterTemp = a + " like ('%" + filterModel[a].filter + "%')";
                    tempDQ = dField + " contains '" + filterModel[a].filter + qu;
                    break;
                case 2: //equals
                    filterTemp = a + " = '" + filterModel[a].filter + "'";
                    tempDQ = dField + " = '" + filterModel[a].filter + "'";
                    break;
                case 3: //starts wiith
                    filterTemp = a + " like ('" + filterModel[a].filter + "%')";
                    tempDQ = dField + " starts with '" + filterModel[a].filter + qu;
                    break;
                case 4: //ends with
                    filterTemp = a + " like ('%" + filterModel[a].filter + "')";
                    tempDQ = dField + " ends with '" + filterModel[a].filter + qu;
                    break;
                };
                break;

            case 'number': //eq    lt       gt 
                switch (filterModel[a].type) {
                case 1: //equals
                    filterTemp = a + " = " + filterModel[a].filter + "";
                    tempDQ = dField + " = " + filterModel[a].filter;
                    break;
                case 2: //less than
                    filterTemp = a + " < " + filterModel[a].filter + "";
                    tempDQ = dField + " < " + filterModel[a].filter;
                    break;
                case 3: //greater than
                    filterTemp = a + " > " + filterModel[a].filter + "";
                    tempDQ = dField + " > " + filterModel[a].filter;
                    break;
                };
                break;

            case 'set':
                var elementTempString = '';
                for (var p in filterModel[a]) { // p = element number in array. filterModel[a][p] = element value(string)
                    var elementTempString = '';
                    logic = (filterTemp == '' ? '' : ' and '); //dont prepend "AND" to the first element
                    elementTempString = a + " = '" + filterModel[a][p] + "'"; //elementTempString = (pieces of filterTemp)
                    filterTemp += logic + elementTempString + ''; // -> int_var/empty_var + '' = string...auto converts to string because '' is string

                    elementTempString = (tempDQ == '' ? '' : ' OR ') + '"' + filterModel[a][p] + '"';
                    tempDQ += elementTempString;
                };
                tempDQ = tempDQ == '' ? '' : (dField + " is " + tempDQ);
                break;

                //filterParamsDisplayQuery +=;
            };
            logic = (completeFilterString != '' && filterTemp != '' ? ' AND ' : ''); //dont prepend "AND" to the start of final string
            completeFilterString += logic + filterTemp + ''; // -> build final search string

            filterParamsDisplayQuery += logic + (tempDQ == '' ? '' : (bl + tempDQ + br));
        };
        var cqa = completeQueryApplied; //shorthand variable
        logic = ((completeFilterString != '' && cqa != '') ? ' AND ' : '');
        completeFilterString += logic + cqa; //add current advanced-filter-string to the header-filter-string

        var result = {
            completeFilterString: completeFilterString,
            filterParamsDisplayQuery: filterParamsDisplayQuery
        };

        return result;
        //Filter Type - Text
        //sku: Object       //field to be filtered
        //  filter: "p"     //value to filter for
        //  type: 4         //1,2,3,4 -> [contains,equals,startswith,endswith]

        //Filter Type - Number
        //siteDepartmentPositionCode: Object
        //    filter: 523   //value to filter for
        //    type: 2       //1,2,3 -> [equals,lessthan,greaterthan]

        //Filter Type - Set
        //siteName: Array[1]//field //if empty->no filter
        //  0: "Hermanus"   //single element of array of String values to filter for
    }

    function testInternal() {
        //alert("Shared Function Works");
    }

    function RecalcStockLineInformationFromAvgWtInternal(avgWt, avgLen, wt, num, inputMask, isAvgWt) {
        /*When calculating from the Avg Wt - we need to do the following:
        
                So depending on what the input mask is going, we need to either take into account that the total weight must recalculate or the total number.
                inputMask - 1 = Wt captured, 2 - Num captured which means that if we have inputmask 1 then the num will be influenced because the wt is being captured and vice versa.
                The other use cases won't really happen because we're disabling the inputs.
        
        
                1. Recalc the avg Len with len/Weight
                2. Multiply the Avg Wt with Num to get new total weight
                */
        var objectToCalc = {
            avgWt: 0,
            avgLen: 0,
            wt: 0,
            num: 0
        };

        //console.log(avgWt);
        //alert("woo changing!");
        objectToCalc.avgWt = CustomRoundInternal(avgWt, 2);
        objectToCalc.avgLen = convertFromAvgWtToAvgLenInternal(CustomRoundInternal(avgWt, 2));

        //console.log("---------->>>" + inputMask);
        switch (Number(inputMask)) {
        case 1:
            //wt is being captured
            objectToCalc.wt = wt;
            objectToCalc.num = CustomRoundInternal(wt / avgWt, 2);
            break;
        case 2:
            //num is being captured
            objectToCalc.wt = CustomRoundInternal(avgWt * num, 2);
            objectToCalc.num = num;
            break;
        }

        return objectToCalc;

    }

    function RecalcStockLineInformationFromAvgLenInternal(avgWt, avgLen, wt, num, inputMask, isAvgWt) {
        /*When calculating from the Avg Wt - we need to do the following:
        1. Recalc the avg Wt with len/Weight
        2. Multiply the Avg Wt with Num to get new total weight
        */
        var objectToCalc = {
            avgWt: 0,
            avgLen: 0,
            wt: 0,
            num: 0
        };

        //console.log(avgWt);
        objectToCalc.avgLen = CustomRoundInternal(avgLen, 2);
        //Will always calculate an avg weight from an average length to calculate the other factors - thereafter it's about choosing which number should change - similar to avg weight changed.
        objectToCalc.avgWt = convertFromAvgLenToAvgWtInternal(CustomRoundInternal(avgLen, 2));

        //console.log("---------->>>" + inputMask);
        switch (Number(inputMask)) {
        case 1:
            //wt is being captured
            objectToCalc.wt = wt;
            objectToCalc.num = CustomRoundInternal(wt / (convertFromAvgLenToAvgWtInternal(avgLen)), 2);
            break;
        case 2:
            //num is being captured
            //This info is coming back asynchronously so I have to have it inline for now...
            objectToCalc.wt = CustomRoundInternal((convertFromAvgLenToAvgWtInternal(avgLen)) * num, 2);
            objectToCalc.num = num;
            break;
        }

        return objectToCalc;
    }

    function RecalcStockLineInformationFromWtInternal(avgWt, avgLen, wt, num, inputMask, isAvgWt) {
        /*When calculating from the  Wt - we need to take the following into consideration:
is the input masked on avg and wt or count OR wt and count.
Input Mask: 
-1 (Avg | Total Wt)
-2 (Avg | Total Count)
-3 (Total Wt | Total Count)
    
    Only 1 or 3 is possible.
    Case 1 then
    1. the count must change i.e num = wt/avgWt

    Case 3 then
    1. Recalc the avgWt
    2. Recalc the avgLen
        */
        var objectToCalc = {
            avgWt: 0,
            avgLen: 0,
            wt: 0,
            num: 0
        };
        console.log("in the recalc of wt");
        console.log(inputMask);

        objectToCalc.wt = CustomRoundInternal(wt, 2);

        switch (Number(inputMask)) {
        case 1:
            //avgWt is being captured
            console.log("Wt being changed, Wt/avgWt being captured - Num Being Calculated");
            objectToCalc.avgWt = avgWt;
            objectToCalc.avgLen = avgLen;
            objectToCalc.num = CustomRoundInternal(wt / avgWt, 2);

            break;
        case 3:
            //num is being captured
            console.log("Wt being changed, Wt/Num being captured - avgWt and avgLen Being Calculated");
            objectToCalc.num = num;
            objectToCalc.avgWt = (CustomRoundInternal(wt / num, 2));
            objectToCalc.avgLen = CustomRoundInternal((convertFromAvgWtToAvgLenInternal((CustomRoundInternal(wt / num, 2)))), 2);
            //This info is coming back asynchronously so I have to have it inline for now...
            break;
        }

        return objectToCalc;

    }

    function RecalcStockLineInformationFromNumInternal(avgWt, avgLen, wt, num, inputMask, isAvgWt) {
        /*When calculating from the  num - we need to take the following into consideration:
is the input masked on avg and wt or count OR wt and count.
Input Mask: 
-1 (Avg | Total Wt)
-2 (Avg | Total Count)
-3 (Total Wt | Total Count)
    
    Only 2 or 3 is possible.
    Case 2 then
    1. the weight must change i.e wt = num*avgWt

    Case 3 then
    1. Recalc the avgWt
    2. Recalc the avgLen
        */
        var objectToCalc = {
            avgWt: 0,
            avgLen: 0,
            wt: 0,
            num: 0
        };
        console.log("in the recalc of num");
        console.log(inputMask);

        objectToCalc.num = CustomRoundInternal(num, 2);

        switch (Number(inputMask)) {
        case 2:
            //avgWt is being captured
            console.log("Num being changed, num/avg being captured - Wt Being Calculated");
            objectToCalc.avgWt = avgWt;
            objectToCalc.avgLen = avgLen;
            objectToCalc.wt = CustomRoundInternal(num * avgWt, 2);

            break;
        case 3:
            //num is being captured
            console.log("Num being changed, Wt/Num being captured - avgWt and avgLen Being Calculated");
            objectToCalc.wt = wt;
            objectToCalc.avgWt = (CustomRoundInternal(wt / num, 2));
            objectToCalc.avgLen = CustomRoundInternal((convertFromAvgWtToAvgLenInternal((CustomRoundInternal(wt / num, 2)))), 2);
            //This info is coming back asynchronously so I have to have it inline for now...
            break;
        }

        return objectToCalc;

    }

    function convertFromAvgWtToAvgLenInternal(input) {
        //There still has to be a lot of logic here w.r.t looking up the correct formula from the DB

        return CustomRoundInternal((16.607 * Math.pow(input, 0.3404)), 2);
    }

    function convertFromAvgLenToAvgWtInternal(input) {
        //There still has to be a lot of logic here w.r.t looking up the correct formula from the DB

        return CustomRoundInternal((Math.pow(input / 16.607, 1 / 0.3404)), 2);
    }


    function CustomRoundInternal(value, exp) {
        if (typeof exp === 'undefined' || +exp === 0)
            return Math.round(value);

        value = +value;
        exp = +exp;

        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }

        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
    }

    function RecalcStockLineInPercentageContributionInternal(stockObject) {
        var deferred = $q.defer();

        var arrayOfRecalcStockLineInPercentageContributionObject = [];
        console.log("recalculating percentages!");

        if (stockObject !== null && stockObject !== undefined) {
            console.log("recalculating percentages! - valid stock object");

            if (stockObject.tblstocklineins_by_fk_stockID !== null && stockObject.tblstocklineins_by_fk_stockID !== undefined) {

                //here we now run through each of the lines and check its contribution to the total in terms of wt

                //let's get the total weight just to check
                var totalWt = 0;

                var i;
                var num = stockObject.tblstocklineins_by_fk_stockID.length;
                for (i = 0; i < num; i++) {
                    totalWt += stockObject.tblstocklineins_by_fk_stockID[i].wt;
                }

                var j;
                var num = stockObject.tblstocklineins_by_fk_stockID.length;
                for (j = 0; j < num; j++) {

                    //var tempPercentageContribution = CustomRoundInternal(stockObject.tblstocklineins_by_fk_stockID[j].wt / totalWt, 5);
                    var RecalcStockLineInPercentageContributionObject = {
                        totalWt: totalWt,
                        stockLineInID: stockObject.tblstocklineins_by_fk_stockID[j].id,
                        percentageOfTotal: CustomRoundInternal(stockObject.tblstocklineins_by_fk_stockID[j].wt / totalWt, 5)
                    };
                    arrayOfRecalcStockLineInPercentageContributionObject.push(RecalcStockLineInPercentageContributionObject);
                }

                console.log(arrayOfRecalcStockLineInPercentageContributionObject);
                deferred.resolve(arrayOfRecalcStockLineInPercentageContributionObject);
            } else {
                deferred.reject();
            }
        } else {
            deferred.reject();
        }
        return deferred.promise;


    }

    function RecalculateFGRInternal(agr, mgr, rgrIn, rgrNow) {
        var deferred = $q.defer();
        var fgr = 0;

        /*
        In this step we are trying to come up with a way to have the growth rate filter down to a single value that we can use to estimate the growht to get the current estimates.
        This logic may change as I am bringing in a new concept called the rgrNow which is a way to take the current growth verification data and not just lump it into the MGR.
        */

        /*
        Logic as follows:
        1. If MGR is captured, all other logic bypassed - MGR used
        2. If no MGR, then enter the other logic
        2.1 If rgrNow, then use that instead
        
        */
        fgr = mgr;

        if (fgr === null || fgr === undefined || fgr <= 0) {
            fgr = 0.5;
        }


        deferred.resolve(fgr);

        return deferred.promise;
    }


    function RecalcStockFromLinesInInternal(stockObject) {
        /*So here, we are going to do the following:
                    1. Accept an entire tblStock + tblStockLineIn object
                    2. Calculate the Line IN's where _isDeleted = false
                    2.1 SUM the weight In, SUM the Num in
                    2.2 Avg the Avg Weight In, Avg the avg Len in (would actually need to also do the % split? so maybe have another function that just calculates the % contribution of each line.
        
                    Also, even though I'm sending the object I think I should be updating directly in here, i should just return an object with the correct values so we can update it directly in the calling function.
                    
                    Also, we should always call the % update to check the percentage each line contributes to the weight so that we can assume that each line has a percentageOfTotal which makes it easier to calc the AGR, RGR, AvgWt, AvgLen...
        
                    */
        var deferred = $q.defer();

        var RecalcStockFromLinesInObject = {
            wtIn: null,
            numIn: null,
            wtCurrent: null,
            numCurrent: null,
            avgWtIn: null,
            avgLenIn: null,
            avgWtCurrent: null,
            avgLenCurrent: null,
            rgrIn: null,
            agr: null,
            fgr: null,
            daysInStock: null,
            arrayOfLinesIn: []
        };

        //This is to capitalise on the % contribution
        var ArrayOfLinesIn = [];

        var PromiseRecalcStockLineInPercentageContributionInternal = RecalcStockLineInPercentageContributionInternal(stockObject);

        PromiseRecalcStockLineInPercentageContributionInternal.then(function (arrayOfRecalcStockLineInPercentageContributionObject) {

            console.log("Called the Recalc of all stock from stock lines in");
            console.log(stockObject);
            if (stockObject !== null && stockObject !== undefined) {
                if (stockObject.tblstocklineins_by_fk_stockID !== null && stockObject.tblstocklineins_by_fk_stockID !== undefined) {
                    //has lines - now have to iterate through them all and get some totals
                    //iterate through the lines to get the totals.

                    console.log(arrayOfRecalcStockLineInPercentageContributionObject);
                    var linesTotal = stockObject.tblstocklineins_by_fk_stockID.length;
                    var wtTotal = 0;
                    var numTotal = 0;
                    var avgWtAverage = 0;
                    var avgLenAverage = 0;
                    var rgrAverage = 0;
                    var agrAverage = 0;
                    var percentageOfTotal = 0;

                    var i;
                    var num = stockObject.tblstocklineins_by_fk_stockID.length;
                    for (i = 0; i < num; i++) {
                        wtTotal += stockObject.tblstocklineins_by_fk_stockID[i].wt;
                        numTotal += stockObject.tblstocklineins_by_fk_stockID[i].num;

                        var j = 0;
                        var numJ = arrayOfRecalcStockLineInPercentageContributionObject.length;
                        for (j = 0; j < numJ; j++) {
                            if (Number(arrayOfRecalcStockLineInPercentageContributionObject[j].stockLineInID) === Number(stockObject.tblstocklineins_by_fk_stockID[i].id)) {
                                //found the ID
                                console.log("found the id");
                                percentageOfTotal = arrayOfRecalcStockLineInPercentageContributionObject[j].percentageOfTotal;

                                ArrayOfLinesIn.push({
                                    "id": stockObject.tblstocklineins_by_fk_stockID[i].id,
                                    "tempGUID": stockObject.tblstocklineins_by_fk_stockID[i].tempGUID,
                                    "percentageOfTotal": arrayOfRecalcStockLineInPercentageContributionObject[j].percentageOfTotal,
                                    //"wt": arrayOfRecalcStockLineInPercentageContributionObject[j].wt,
                                    //"num": arrayOfRecalcStockLineInPercentageContributionObject[j].num,
                                    //"avgWt": arrayOfRecalcStockLineInPercentageContributionObject[j].avgWt,
                                    //"avgLen": arrayOfRecalcStockLineInPercentageContributionObject[j].avgLen,
                                    //"rgr": arrayOfRecalcStockLineInPercentageContributionObject[j].rgr
                                });

                                console.log(ArrayOfLinesIn);

                                console.log(percentageOfTotal);
                                //console.log(stockObject.tblstocklineins_by_fk_stockID[i].avgWt * percentageOfTotal);
                                //Once found, exit the loop.
                                break;

                            }
                        }

                        avgWtAverage += stockObject.tblstocklineins_by_fk_stockID[i].avgWt * percentageOfTotal;
                        console.log(avgWtAverage);
                        avgLenAverage += stockObject.tblstocklineins_by_fk_stockID[i].avgLen * percentageOfTotal;
                        rgrAverage += stockObject.tblstocklineins_by_fk_stockID[i].rgr * percentageOfTotal;
                        agrAverage += stockObject.tblstocklineins_by_fk_stockID[i].agr * percentageOfTotal;
                    }

                    RecalcStockFromLinesInObject.wtIn = CustomRoundInternal(wtTotal, 2);
                    RecalcStockFromLinesInObject.numIn = CustomRoundInternal(numTotal, 2);
                    RecalcStockFromLinesInObject.avgWtIn = CustomRoundInternal(avgWtAverage, 2);
                    console.log(RecalcStockFromLinesInObject.avgWtIn);
                    RecalcStockFromLinesInObject.avgLenIn = CustomRoundInternal(avgLenAverage, 2);
                    RecalcStockFromLinesInObject.rgrIn = CustomRoundInternal(rgrAverage, 2);

                    console.log(RecalcStockFromLinesInObject);

                    var promiseRecalculateFGRInternal = RecalculateFGRInternal(stockObject.agr, stockObject.mgr, stockObject.rgrIn, stockObject.rgrNow);

                    promiseRecalculateFGRInternal.then(
                        //Success
                        function (fgr) {

                            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>" + fgr + "<<<<<<<<<<<<<<<<<<<<<<<");
                            RecalcStockFromLinesInObject.fgr = fgr;

                            var promiseGrowStockInternal = GrowStockInternal(stockObject.dateIn, RecalcStockFromLinesInObject.wtIn, RecalcStockFromLinesInObject.numIn, RecalcStockFromLinesInObject.avgWtIn, RecalcStockFromLinesInObject.avgLenIn, RecalcStockFromLinesInObject.fgr);

                            promiseGrowStockInternal.then(
                                //Success
                                function (growthObject) {
                                    console.log("GROWTH OBJECT -> ");
                                    console.log(growthObject);

                                    RecalcStockFromLinesInObject.wtCurrent = growthObject.wtCurrent;
                                    RecalcStockFromLinesInObject.numCurrent = growthObject.numCurrent;
                                    RecalcStockFromLinesInObject.avgWtCurrent = growthObject.avgWtCurrent;
                                    RecalcStockFromLinesInObject.avgLenCurrent = growthObject.avgLenCurrent;
                                    RecalcStockFromLinesInObject.daysInStock = growthObject.daysInStock;
                                    console.log("******************************");
                                    RecalcStockFromLinesInObject.arrayOfLinesIn = ArrayOfLinesIn;
                                    console.log(RecalcStockFromLinesInObject);
                                    console.log(ArrayOfLinesIn);

                                    deferred.resolve(RecalcStockFromLinesInObject, ArrayOfLinesIn);

                                },
                                //FAIL
                                function () {});

                        },
                        //Fail
                        function () {});




                } else {
                    //No stock lines, therefore everything is 0.
                    RecalcStockFromLinesInObject.avgLenIn = 0;
                    RecalcStockFromLinesInObject.avgWtIn = 0;
                    RecalcStockFromLinesInObject.wtIn = 0;
                    RecalcStockFromLinesInObject.numIn = 0;
                    RecalcStockFromLinesInObject.daysInStock = 0;
                    RecalcStockFromLinesInObject.mgr = 0;
                    RecalcStockFromLinesInObject.agr = 0;
                    RecalcStockFromLinesInObject.rgrIn = 0;
                    RecalcStockFromLinesInObject.fgr = 0;
                    deferred.resolve(RecalcStockFromLinesInObject);
                }
            } else {
                deferred.reject(RecalcStockFromLinesInObject, LinesInContribution);
            }
        }, function () {});

        return deferred.promise;
    }

    function GrowStockInternal(dateIn, wtIn, numIn, avgWtIn, avgLenIn, fgr) {

        //Make this happen as a function of a promise
        var deferred = $q.defer();

        var currentDate = new Date();
        var dateInDate = new Date(Date.parse(dateIn));

        var growStockObject = {
            avgWtIn: avgWtIn,
            avgWtCurrent: null,
            avgLenIn: avgLenIn,
            avgLenCurrent: null,
            wtIn: wtIn,
            wtCurrent: null,
            numIn: numIn,
            numCurrent: null,
            daysInStock: null,
            fgr: fgr
        };

        /*So now we have to take the in information and calculate the estimated information for now (current)
        Basic logic is as follows:
        1. get the difference between the dateIn and now in days (if negative, use the in information
        2. take these days of stock and divide the MGR by 30.5 to get a day growth part.
        3. see how many mm it grew in the period in days
        4. add this to the avgLenIn and this would be avgLenCurrent
        5. convert the avgLenCurrent to avgWeightCurrent
        6. multiple the numIn with avgWeightCurrent to get wtCurrent
        */

        var daysInStock = getDaysInStockInternal(dateInDate); //CustomRoundInternal(((currentDate - dateInDate) / (1000 * 60 * 60)) / 24, 2);
        console.log(dateInDate);
        console.log(daysInStock);
        if (daysInStock <= 0) {
            //So it's created now or in the past
            growStockObject.daysInStock = 0;
            growStockObject.avgWtCurrent = avgWtIn;
            growStockObject.avgLenCurrent = avgLenIn;
            growStockObject.wtCurrent = wtIn;
            growStockObject.numCurrent = numIn;
        } else {
            //Here's where it gets interesting...
            growStockObject.daysInStock = daysInStock;
            var lengthGrowthPerDay = CustomRoundInternal(fgr / 30.5, 10);
            var lengthGrowthPerDaysInStock = CustomRoundInternal(lengthGrowthPerDay * daysInStock, 2);
            console.log(lengthGrowthPerDaysInStock);

            growStockObject.avgLenCurrent = CustomRoundInternal(CustomRoundInternal(avgLenIn, 5) + CustomRoundInternal(lengthGrowthPerDaysInStock, 5), 2);

            //console.log(growStockObject.avgLenCurrent);

            console.log(convertFromAvgLenToAvgWtInternal(growStockObject.avgLenIn) + "<<<>>>>????" + convertFromAvgLenToAvgWtInternal(growStockObject.avgLenCurrent));

            growStockObject.avgWtCurrent = CustomRoundInternal(convertFromAvgLenToAvgWtInternal(CustomRoundInternal(CustomRoundInternal(CustomRoundInternal(avgLenIn, 5) + CustomRoundInternal(lengthGrowthPerDaysInStock, 5), 2), 5)), 2);
            console.log(growStockObject.avgWtCurrent);
            growStockObject.numCurrent = numIn;
            growStockObject.wtCurrent = CustomRoundInternal(growStockObject.numCurrent * growStockObject.avgWtCurrent, 2);
        }

        console.log(growStockObject);

        deferred.resolve(growStockObject);

        return deferred.promise;

    }

    function CreateNewImportStockInternal(ID, dateIn, mgr, avgWtIn, avgLenIn, wtIn, numIn, siteID, positionID, taskMasterID, stockGroupID, stockBatchID) {

        //Make this happen as a function of a promise
        var deferred = $q.defer();

        console.log("Shared Function to create stock:" + taskMasterID);

        var tblStockTempGUID = GenerateUUIDInternal();
        var tblStockLineInTempGUID = GenerateUUIDInternal();

        var baseObject = {
            newStock: {
                id: null,
                sku: ID,
                numIn: numIn,
                numCurrent: null,
                wtIn: wtIn,
                wtCurrent: null,
                avgLenIn: avgLenIn,
                avgLenCurrent: null,
                avgWtIn: avgWtIn,
                avgWtCurrent: null,
                fk_companyID: '{COMPANY_ID}',
                fk_openedByTaskID: taskMasterID,
                dateIn: dateIn.toISOString().substring(0, 10),
                mgr: mgr,
                fgr: mgr,
                rgrIn: null,
                fk_siteID: siteID,
                fk_departmentSitePositionID: positionID,
                daysInStock: getDaysInStockInternal(dateIn),
                _rowStatus: "NEW",
                tempGUID: tblStockTempGUID,
                fk_stockGroupID:stockGroupID,
                fk_stockBatchID:stockBatchID,
                tblstocklineins_by_fk_stockID: [{
                    id: null,
                    fk_stockID: null,
                    legacyCode: null,
                    legacyID: null,
                    wt: wtIn,
                    avgWt: avgWtIn,
                    avgLen: avgLenIn,
                    num: numIn,
                    dateAdded: dateIn.toISOString().substring(0, 10),
                    dateTimeCreated: new Date(),
                    fk_stockLineCategoryID: 4,
                    rgr: null,
                    fk_fromStockID: null,
                    agr: null,
                    fk_createdByTaskID: taskMasterID,
                    fk_companyID: '{COMPANY_ID}',
                    fk_fromStockLineOutID: null,
                    _rowStatus: "NEW",
                    tempGUID: tblStockLineInTempGUID,
                    fk_stockTempGUID: tblStockTempGUID,
                    percentageOfTotal: 1
                    }]

            }
        };
        
        console.log(baseObject);

        //Now set the parent GUID
        //console.log(baseObject);
        //baseObject.newStock.tblstocklineins_by_fk_stockID.fk_stockTempGUID = baseObject.newStock.tempGUID;

        /*            var currentEstimates = new SharedFunctions.GrowStock(baseObject.newStock.dateIn, baseObject.newStock.avgWtIn, baseObject.newStock.avgLenIn, baseObject.newStock.wtIn, baseObject.newStock.numIn, baseObject.newStock.fgr);
         */
        
        var PromiseRecalcStockFromLinesInInternal = RecalcStockFromLinesInInternal(baseObject.newStock);
        
        PromiseRecalcStockFromLinesInInternal.then(function(successData)
                                                   {
            baseObject.newStock.daysInStock = successData.daysInStock;
                baseObject.newStock.numCurrent = successData.numCurrent;
                baseObject.newStock.wtCurrent = successData.wtCurrent;
                baseObject.newStock.avgLenCurrent = successData.avgLenCurrent;
                baseObject.newStock.avgWtCurrent = successData.avgWtCurrent;
                baseObject.newStock.daysInStock = successData.daysInStock;
            
        deferred.resolve(baseObject);
        },function(failData){});
        
        /*
        var PromiseGrowStock = GrowStockInternal(baseObject.newStock.dateIn, baseObject.newStock.avgWtIn, baseObject.newStock.avgLenIn, baseObject.newStock.wtIn, baseObject.newStock.numIn, baseObject.newStock.fgr);

        PromiseGrowStock.then(
            //Success
            function (currentEstimates) {
                console.log("in the PROMISE!!!!!!!!!!!!!!");
                console.log(currentEstimates);
                baseObject.newStock.daysInStock = currentEstimates.daysInStock;
                baseObject.newStock.numCurrent = currentEstimates.numCurrent;
                baseObject.newStock.wtCurrent = currentEstimates.wtCurrent;
                baseObject.newStock.avgLenCurrent = currentEstimates.avgLenCurrent;
                baseObject.newStock.avgWtCurrent = currentEstimates.avgWtCurrent;
                baseObject.newStock.daysInStock = currentEstimates.daysInStock;



                deferred.resolve(baseObject);

            },
            //Failure
            function () {}
        );
        */


        return deferred.promise;

    }


    function GetAverage(arrayInput) {


    }

    function getDaysInStockInternal(dateIn) {
        return CustomRoundInternal(((new Date() - dateIn) / (1000 * 60 * 60)) / 24, 2);
    }

    function GenerateUUIDInternal() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    
    function getRowNumFromArray(arrayToIterate, columnToFind, valueToFind)
    {
        var rowNumFound = -1;
        
        var numI;
        var numICount = arrayToIterate.length;
        for (numI = 0; numI < numICount; numI++) {
            if(String(arrayToIterate[numI][columnToFind]) === String(valueToFind))
            {
                rowNumFound = numI;
                break;
            }
        }
        return rowNumFound;
    }

    return factory;

}]);