const in_file_vcssz = document.getElementById("file_vcssz")
const in_file_aavso = document.getElementById("file_aavso")

const [file_aavso] = in_file_aavso.files 
const content_vcssz = document.getElementById("content_vcssz")
const content_aavso = document.getElementById("content_aavso")

const btn_compare = document.getElementById("btn_compare")
const btn_reset = document.getElementById("btn_reset")

var dataVCSSZ = [] // data loaded from observation list - VCSSZ
var dataAAVSO = [] // data loaded from observation list - AAVSO
var dataToVCSSZ = [] // initial list of observations to be sent to VCSSZ - loaded after obs list comparison
var dataToAAVSO = [] // initial list of observations to be sent to AAVSO - loaded after obs list comparison

var table_to_aavso // used to reference to Tabulator object later, holding data to be sent to AAVSO
var table_to_vcssz // used to reference to Tabulator object later, holding data to be sent to VCSSZ

var obscode_vcssz = ""; // ovserver code in the VCSSZ DB - filled when obs list loaded
var obscode_aavso = ""; // ovserver code in the AAVSO DB - filled when obs list loaded

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
        var ID = -1;
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
        content_vcssz.innerHTML = " - " + dataVCSSZ.length + " észlelés betöltve"

        if(dataAAVSO.length > 0 && dataVCSSZ.length > 0) {
            btn_compare.classList.remove("d-none")
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
        var ID = -1;
        obscode_aavso = in_file_aavso.value.substring(in_file_aavso.value.lastIndexOf("_") + 1).replace(".txt", "")
        document.getElementById("obscode_aavso").innerText = obscode_aavso
        dataLines.forEach(l => {
            if (l.indexOf("Vis") == 0) {
                let cols = l.split(" ## ")
                let star = cols[1]
                if(regexp.test(cols[1])) {
                    let star_orig = cols[1].match(regexp)[0]
                    let new_star = "V" + pad(star_orig.replace("V","") ,4)
                    star = star.replace(star_orig, new_star)
                }
                ID += 1;
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
                    INOTHER: false
                })
            }
        })
        content_aavso.innerHTML = " - " + dataAAVSO.length + " észlelés betöltve"

        if(dataAAVSO.length > 0 && dataVCSSZ.length > 0) {
            btn_compare.classList.remove("d-none")
        }
    }, false);

    if (file_aavso) {
        reader.readAsText(file_aavso)
    }
}
in_file_aavso.addEventListener("change", processAAVSO)


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
        ]
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
}

function compareData() {   
    btn_compare.setAttribute("disabled", "disabled")
    dataToAAVSO = []
    dataToVCSSZ = []

    dataVCSSZ.forEach(v => {
        dataAAVSO.every(a => {
            if(a.JD == v.JD && (a.STAR == v.STAR || a.STAR.replaceAll(" ", "") == v.STAR)) {
                v.INOTHER = true
                return false
            }
            return true
        })
    })

    dataAAVSO.forEach(a => {
        dataVCSSZ.every(v => {
            if(a.JD == v.JD && (a.STAR == v.STAR || a.STAR.replaceAll(" ", "") == v.STAR)) {
                a.INOTHER = true
                return false
            }
            return true
        })
    })

    dataToAAVSO = dataVCSSZ.filter(r => r.INOTHER == false)
    dataToVCSSZ = dataAAVSO.filter(r => r.INOTHER == false)

    getObsListTablulator("observations_vcssz", dataVCSSZ, "vcssz")
    getObsListTablulator("observations_aavso", dataAAVSO, "aavso")

    table_to_aavso = getSendListTablulator("observations_to_aavso", dataToAAVSO, "vcssz")
    table_to_vcssz = getSendListTablulator("observations_to_vcssz", dataToVCSSZ, "aavso")

    document.querySelectorAll(".d-none").forEach(el => el.classList.remove("d-none"))

    btn_compare.removeAttribute("disabled")
    document.getElementById("firstrow").classList.add("d-none")
}
btn_compare.addEventListener("click", compareData)

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