const in_file_vcssz = document.getElementById("file_vcssz")
const in_file_aavso = document.getElementById("file_aavso")
const in_JD_tolerance = document.getElementById("in_JD_tolerance")

const [file_aavso] = in_file_aavso.files 
const content_vcssz = document.getElementById("content_vcssz")
const content_aavso = document.getElementById("content_aavso")

const btn_compare = document.getElementById("btn_compare")
const btn_reset = document.getElementById("btn_reset")

const aavso_duplicates = document.getElementById("aavso_duplicates")

var dataVCSSZ = [] // data loaded from observation list - VCSSZ
var dataAAVSO = [] // data loaded from observation list - AAVSO
var dataToVCSSZ = [] // initial list of observations to be sent to VCSSZ - loaded after obs list comparison
var dataToAAVSO = [] // initial list of observations to be sent to AAVSO - loaded after obs list comparison

var table_to_aavso // used to reference to Tabulator object later, holding data to be sent to AAVSO
var table_to_vcssz // used to reference to Tabulator object later, holding data to be sent to VCSSZ

var obscode_vcssz = "" // ovserver code in the VCSSZ DB - filled when obs list loaded
var obscode_aavso = "" // ovserver code in the AAVSO DB - filled when obs list loaded

var aavso_dplucated_obs = [] // list of duplicated AAVSO observations (IDs)

var JDTolerance = 0.001
in_JD_tolerance.addEventListener("change", () => {
    JDTolerance = in_JD_tolerance.value / 10000
    document.getElementById("JD_tolerance_desc").innerHTML= "JD." + JDTolerance + ", " + (86400 * JDTolerance).toFixed(0) + "mp"
})

/**
 * Identify Vxxxx ZZZ type variable names by matching strings starting with V and 3-4 digits
 */
const regexp = /^(V)(\d{3,4})/g; 

const commentcodes = {
    "B": "fényes égbolt, Hold, hajnal, stb",
    "U": "felhők, köd, stb",
    "W": "nagyon gyenge nyugodtság",
    "L": "a változó közel volt a horizonthoz, fákhoz vagy egyéb terepakadályhoz",
    "D": "szokatlan tevékenység: elhalványulás, felfényesedés, stb",
    "Y": "kitörés",
    "K": "nem AAVSO-térkép",
    "S": "probléma az összehasonlítás közben",
    "Z": "bizonytalan a becsült fényesség",
    "I": "bizonytalan a csillag beazonosítása",
    "V": "nagyon halvány csillag, közel a határmagnitúdóhoz, csak héha lehetett megpillantani"
}

// sorter function: first by JD, then star name
const observationSorter = (a,b)=> (a.JD - b.JD || a.STAR.localeCompare(b.STAR)  )

/**
 * Event handler for observation list file input.
 * Parses an AAVSO visual format export file from VCSSZ database
 */
function processVCSSZ() {
    var reader = new FileReader();
    const [file_vcssz] = in_file_vcssz.files 
    reader.addEventListener("load", () => {
        dataVCSSZ = []
        let dataLines = reader.result.split("\n")
        var ID = 0;
        dataLines.forEach(l => {
            if (l.indexOf("#OBSCODE=") > -1) {
                obscode_vcssz = l.split("=")[1]
                document.getElementById("obscode_vcssz").innerText = obscode_vcssz
            }
            if (l.indexOf("#") == -1 && l.length > 30) {
                let cols = l.split(",")
                ID += 1;
                dataVCSSZ.push({
                    ID: ID,
                    STAR: cols[0] ,
                    JD: parseFloat(cols[1].substring(0,12)), 
                    JD_ORIG: cols[1],
                    MAG: cols[2], 
                    COMMENTCODE: cols[3] == "na" ? "" : cols[3],
                    COMP1: cols[4] == "na" ? "" : (parseInt(cols[4]) == parseFloat(cols[4]) ? parseInt(cols[4]) : parseInt(parseFloat(cols[4])*10) ),
                    COMP2: cols[5] == "na" ? "" : (parseInt(cols[5]) == parseFloat(cols[5]) ? parseInt(cols[5]) : parseInt(parseFloat(cols[5])*10) ),
                    MAP: cols[6],
                    COMMENT: cols[7],
                    INOTHER: false
                })
            }
        })
        dataVCSSZ.sort(observationSorter)
        content_vcssz.innerHTML = " - " + dataVCSSZ.length + " észlelés betöltve"

        if(dataAAVSO.length > 0 && dataVCSSZ.length > 0) {
            btn_compare.parentElement.classList.remove("d-none")
        }
    }, false);

    if (file_vcssz) {
        reader.readAsText(file_vcssz)
    }
}
in_file_vcssz.addEventListener("change", processVCSSZ)


/**
 * Left padding with a character to a defined total length. 
 * Used to Convert short V-numbered variables to 4 digit version, e.g. V493 » V0493
 * @param {*} str padding string
 * @param {*} max max length
 * @returns 
 */
function pad (str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}


/**
 * Event handler for observation list file input.
 * Parses an export from AAVSO WebObs / Downnload my observations function
 */
function processAAVSO() {
    var reader = new FileReader();
    const [file_aavso] = in_file_aavso.files 
    reader.addEventListener("load", () => {
        dataAAVSO = []
        let dataLines = reader.result.split("\n")
        var ID = 0;
        obscode_aavso = in_file_aavso.value.substring(in_file_aavso.value.lastIndexOf("_") + 1).replace(".txt", "")
        document.getElementById("obscode_aavso").innerText = obscode_aavso
        dataLines.forEach((l,i) => {
            if (l.indexOf("Vis") == 0) {
                let cols = l.split(" ## ")
                let star = cols[1]
                let duplicate = false
                if(regexp.test(cols[1])) {
                    let star_orig = cols[1].match(regexp)[0]
                    let new_star = "V" + pad(star_orig.replace("V","") ,4)
                    star = star.replace(star_orig, new_star)
                }
                ID += 1;
                // duplicate detection
                if(ID>0) {
                    if(dataLines[i-1] == dataLines[i]) {
                        duplicate = true
                        console.log(i,dataAAVSO.length)
                        dataAAVSO[i-3].DUPLICATE = true // new record not added yet, thus i and not i-1
                        aavso_dplucated_obs.push(...[ID-1, ID])
                    }
                }
                dataAAVSO.push({
                    ID: ID,
                    STAR: star ,
                    JD: parseFloat(cols[3].substring(0,12)), 
                    JD_ORIG: cols[3],
                    MAG: (cols[4] == "1" ? "<" : "") + cols[5], 
                    COMMENTCODE: cols[6],
                    COMP1: cols[10] == "" ? "" : (parseInt(cols[10]) == parseFloat(cols[10]) ? parseInt(cols[10]) : parseInt(parseFloat(cols[10])*10) ), // if the value is a float then multiply by 10, use the value otherwise
                    COMP2: cols[12] == "" ? "" : (parseInt(cols[12]) == parseFloat(cols[12]) ? parseInt(cols[12]) : parseInt(parseFloat(cols[12])*10) ), // if the value is a float then multiply by 10, use the value otherwise
                    MAP: cols[14],
                    COMMENT: "na",
                    INOTHER: false,
                    DUPLICATE: duplicate
                })
            }
        })
        dataAAVSO.sort(observationSorter)
        content_aavso.innerHTML = " - " + dataAAVSO.length + " észlelés betöltve" + (aavso_dplucated_obs.length > 0 ? (", " + aavso_dplucated_obs.length / 2 + " duplikáció!") : "")

        if(dataAAVSO.length > 0 && dataVCSSZ.length > 0) {
            btn_compare.parentElement.classList.remove("d-none")
        }
    }, false);

    if (file_aavso) {
        reader.readAsText(file_aavso)
    }
}
in_file_aavso.addEventListener("change", processAAVSO)

/**
 * Formats a comment code field of the tables to show tooltip with human readable version of the comment codes
 */
function commCodeFormatter(cell, formatterParams, onRendered ) {
    onRendered(function() { 
    if(cell.getValue() != "") { 
        new bootstrap.Tooltip(
            cell.getElement(),  
            {
                delay: { "show": 500, "hide": 100 },
                html: true, 
                placement: "right",
                title: cell.getValue().replaceAll(" ","").replaceAll(",","").split("").map(c => '<p class="mb-0"><b>' + c + '</b>: ' + commentcodes[c] + '</p>' ).join("")
            }
        )
        }
    })  
    return cell.getValue()
}


/**
 * Creates a table from list of parsed observations
 * @param {*} container ID of the element where the table is to be created
 * @param {*} data JSON data for the table
 * @param {*} db Database where the data is from: vcssz or aavso
 * @returns 
 */
function getObsListTablulator(container, data, db) {
    var tbl = new Tabulator("#" + container, {
        data: data, 
        height:"338px",
        layout:"fitColumns",
        columns: [
            {title:"#", field:"ID",  width: 40},
            {title:"Csillag", field:"STAR", headerFilter:"input"},
            {title:"JD", field:"JD", headerFilter:"input", width:110},
            {title:"Fényesség", field:"MAG", headerFilter:"input", width: 70},
            {title:"ÖH1", field:"COMP1", headerFilter:"input", width: 65},
            {title:"ÖH2", field:"COMP2", headerFilter:"input", width: 65},
            {title:"Térkép", field:"MAP", headerFilter:"input"},
            {title:"Megj. kód", field:"COMMENTCODE", headerFilter:"input", width: 70, formatter: commCodeFormatter},
            {title: db == "vcssz" ? "AAVSO?" : "VCSSZ?", field: "INOTHER", headerFilter:"input", formatter:"tickCross", width: 70}, 
            {title:"Hozzáadás", 
                formatter:(cell, formatterParams, onRendered )=> {
                    onRendered(function() { new bootstrap.Tooltip(cell.getElement().querySelector('button'),  {delay: { "show": 500, "hide": 100 }}) })  
                    return `<button class="btn btn-xs btn-success addDeleteBtn" data-bs-toggle="tooltip" data-bs-placement="right" title="Hozzáadás az elküldendő listához"> + </button>`
                    
                }, 
                width:40, cellClick:function(e, cell){
                    (db == "vcssz" ? table_to_aavso : table_to_vcssz).addRow( cell.getRow().getData() );
                }
            },
        ],
        rowFormatter:function(row){
            if(row.getData().DUPLICATE){
                row.getElement().style.backgroundColor = "#d67200"; //apply css change to row element
            }
        }
    });

    tbl.on("dataLoaded", function(data){
        var el = document.getElementById("num_total_" + db);
        el.innerHTML = data.length;
    });
    tbl.on("dataFiltered", function(filters, rows){
        var el = document.getElementById("num_filtered_" + db);
        el.innerHTML = rows.length;
    });

    return tbl
}


/**
 * Creates a table from list of to be sent observations
 * @param {*} container ID of the element where the table is to be created
 * @param {*} data JSON data for the table
 * @param {*} db Database where the data is from: vcssz or aavso
 * @returns 
 */
function getSendListTablulator(container, data, db) {
    if(data.length > 0) {
        var tbl = new Tabulator("#" + container, {
            data: data, //assign data to table
            height:"338px",
            layout:"fitColumns",
            columns: [
                {title:"#", field:"ID", width: 40},
                {title:"Csillag", field:"STAR", headerFilter:"input", width: 200},
                {title:"JD", field:"JD", headerFilter:"input", width:110},
                {title:"Fényesség", field:"MAG", headerFilter:"input", width: 70},
                {title:"ÖH1", field:"COMP1", headerFilter:"input", width: 70},
                {title:"ÖH2", field:"COMP2", headerFilter:"input", width: 70},
                {title:"Térkép", field:"MAP", headerFilter:"input"},
                {title:"Megj. kód", field:"COMMENTCODE", headerFilter:"input", formatter: commCodeFormatter},
                {title:"Törlés", 
                    formatter:(cell, formatterParams, onRendered )=> {
                        onRendered(function() { new bootstrap.Tooltip(cell.getElement().querySelector('button'),  {delay: { "show": 500, "hide": 100 }}) })  
                        return `<button class="btn btn-xs btn-danger addDeleteBtn" data-bs-toggle="tooltip" data-bs-placement="right" title="Eltávolítás az elküldendő listáról"> - </button>`
                    },  width:40,  cellClick:function(e, cell){
                    bootstrap.Tooltip.getInstance(e.target).dispose()
                    cell.getRow().delete();
                }},
            ]
        });

        tbl.on("dataLoaded", function(data){
            document.getElementById("observations_to_" + (db == "vcssz" ? "aavso" : "vcssz") + "_num").innerHTML = "(" + data.length + ")"
        });
        tbl.on("rowAdded", function(){
            document.getElementById("observations_to_" + (db == "vcssz" ? "aavso" : "vcssz") + "_num").innerHTML = "(" + tbl.getData().length + ")"
        });
        tbl.on("rowDeleted", function(){
            document.getElementById("observations_to_" + (db == "vcssz" ? "aavso" : "vcssz") + "_num").innerHTML = "(" + tbl.getData().length + ")"
        });

        return tbl
    } else {
        document.getElementById(container).innerHTML = "Nincs hiányzó észlelés"
        document.getElementById("btn_download_list_to_" + (db == "vcssz" ? "aavso" : "vcssz")).classList.add("invisible")
        document.getElementById(db + "_warning").classList.add("invisible")
        return undefined
    }
}

function compareData() {   
    btn_compare.setAttribute("disabled", "disabled")
    
    dataToAAVSO = []
    dataToVCSSZ = []

    var start = new Date()
    var IDFrom = 0;
    dataVCSSZ.forEach((v,j) => {
        for(let i = IDFrom; i < dataAAVSO.length; i++) {
            if (dataAAVSO[i].STAR == v.STAR || dataAAVSO[i].STAR.replaceAll(" ", "") == v.STAR) {
                if(Math.abs(dataAAVSO[i].JD - v.JD) <= JDTolerance) {
                    v.INOTHER = true
                    IDFrom = i 
                    break
                }
            }
        }
    })

    IDFrom = 0
    dataAAVSO.forEach(a => {
        for(let i = IDFrom; i < dataVCSSZ.length; i++) {
            if (a.STAR == dataVCSSZ[i].STAR || a.STAR.replaceAll(" ", "") == dataVCSSZ[i].STAR) {
                if(Math.abs(a.JD - dataVCSSZ[i].JD) <= JDTolerance) {
                    a.INOTHER = true
                    IDFrom = i
                    break
                }
            }
        }
    })

    console.log("process time:", (new Date()) - start)

    dataToAAVSO = dataVCSSZ.filter(r => r.INOTHER == false)
    dataToVCSSZ = dataAAVSO.filter(r => r.INOTHER == false)

    getObsListTablulator("observations_vcssz", dataVCSSZ, "vcssz")
    getObsListTablulator("observations_aavso", dataAAVSO, "aavso")

    table_to_aavso = getSendListTablulator("observations_to_aavso", dataToAAVSO, "vcssz")
    table_to_vcssz = getSendListTablulator("observations_to_vcssz", dataToVCSSZ, "aavso")

    if(table_to_aavso === undefined) {
        document.getElementById("btn_download_list_to_aavso").classList.add("d-none")
        document.getElementById("btn_download_list_to_vcssz").classList.add("d-none")
        document.querySelectorAll(".border-warning").forEach(e => e.classList.add("d-none"))
    }

    document.querySelectorAll(".d-none").forEach(el => el.classList.remove("d-none"))
    document.querySelectorAll(".invisible").forEach(el => el.classList.add("d-none"))

    if(aavso_dplucated_obs.length > 0) {
        aavso_duplicates.innerHTML += aavso_dplucated_obs.map((id, i) => i%2 == 0 ? id + " - " + aavso_dplucated_obs[i+1]  : undefined).filter(id => id != undefined).join(", ")
    } else {
        aavso_duplicates.classList.add("d-none")
    }

    btn_compare.removeAttribute("disabled")
    document.getElementById("firstrow").classList.add("d-none")    
}
btn_compare.addEventListener("click", compareData)


/**
 * Generates AAVSO visual format from a to be exported table and downloads it as filex.
 * @param {string} toDB To which DB the records will be sent: vcssz or aavso
 */
function downloadSendList(toDB) {
    dataToSend = []
    var list = [
        "#TYPE=VISUAL",
        "#OBSCODE=" + (toDB == "vcssz" ? obscode_vcssz : obscode_aavso),
        "#SOFTWARE=VCSSZ vs AAVSO comparer by Balazs Eigner",
        "#DELIM=,",
        "#DATE=JD",
        "#NAME,DATE,MAG,COMMENTCODE,COMP1,COMP2,CHART,NOTES"
    ]
    var data = (toDB == "vcssz" ? table_to_vcssz : table_to_aavso).getData()
    console.log(data)
    data.forEach(obs => {
        list.push(
            obs.STAR +","+
            obs.JD_ORIG +","+
            obs.MAG +","+
            obs.COMMENTCODE +","+
            obs.COMP1 +","+
            obs.COMP2 +","+
            obs.MAP +","+
            obs.COMMENT
        )
    })
    console.log(list.join("\n"))

    var filename = 
        (toDB == "vcssz" ? "AAVSO_to_VCSSZ_" : "VCSSZ_to_AAVSO_") + 
        (toDB == "vcssz" ? obscode_vcssz : obscode_aavso) + 
        (new Date()).toISOString().substring(0,19).replaceAll(":","").replaceAll("-","") + 
        ".txt"
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( list.join("\n") ));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}
document.getElementById("btn_download_list_to_aavso").addEventListener("click", () => { downloadSendList("aavso") })
document.getElementById("btn_download_list_to_vcssz").addEventListener("click", () => { downloadSendList("vcssz") })

// light/dark theme toggler
document.getElementById("btn_toggle_theme").addEventListener("click", (e)=>{
    let btn = e.target
    let currentTheme = btn.dataset.theme
    btn.classList.toggle("bi-moon-star")
    btn.classList.toggle("bi-sun")
    if(currentTheme == "dark") {
        document.getElementById("theme_light_bs").removeAttribute("disabled")
        document.getElementById("theme_dark_bs").setAttribute("disabled", true)
        document.getElementById("theme_light_tab").removeAttribute("disabled")
        document.getElementById("theme_dark_tab").setAttribute("disabled", true)
        
    } else {
        document.getElementById("theme_dark_bs").removeAttribute("disabled")
        document.getElementById("theme_light_bs").setAttribute("disabled", true)
        document.getElementById("theme_dark_tab").removeAttribute("disabled")
        document.getElementById("theme_light_tab").setAttribute("disabled", true)
    }
    e.target.dataset.theme = currentTheme == "dark" ? "light" : "dark"
})