const in_file_vcssz = document.getElementById("file_vcssz")
const in_file_aavso = document.getElementById("file_aavso")

const [file_aavso] = in_file_aavso.files 
const content_vcssz = document.getElementById("content_vcssz")
const content_aavso = document.getElementById("content_aavso")

const btn_compare = document.getElementById("btn_compare")
const btn_reset = document.getElementById("btn_reset")

var dataVCSSZ = []
var dataAAVSO = [] 
var dataToVCSSZ = []
var dataToAAVSO = []

function processVCSSZ() {
    var reader = new FileReader();
    const [file_vcssz] = in_file_vcssz.files 
    reader.addEventListener("load", () => {
        dataVCSSZ = []
        let dataLines = reader.result.split("\n")
        dataLines.forEach(l => {
            if (l.indexOf("#") == -1 && l.length > 30) {
                let cols = l.split(",")
                dataVCSSZ.push({
                    STAR: cols[0] ,
                    JD: parseFloat(cols[1].substring(0,12)), //parseFloat(parseFloat(cols[1]).toFixed(4)),
                    //FAINTER: cols[2].startsWith("<") ? "<" : "",
                    MAG: cols[2], // parseFloat(cols[2].replace("<","")),
                    COMMENTCODE: cols[3] == "na" ? "" : cols[3],
                    COMP1: cols[4] == "na" ? "" : parseInt(cols[4]),
                    COMP2: cols[5] == "na" ? "" : parseInt(cols[5]),
                    MAP: cols[6],
                    COMMENT: cols[7],
                    INAAVSO: false
                })
            }
        })
        console.log(dataVCSSZ)
        
        content_vcssz.innerHTML = "Loaded " + dataVCSSZ.length + " observations."

        if(dataAAVSO.length > 0 && dataVCSSZ.length > 0) {
            btn_compare.removeAttribute("disabled")
        }
    }, false);

    if (file_vcssz) {
        reader.readAsText(file_vcssz)
    }
}
in_file_vcssz.addEventListener("change", processVCSSZ)


const regexp = /^(V)(\d{1,4})/g;
function pad (str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}
function processAAVSO() {
    var reader = new FileReader();
    const [file_aavso] = in_file_aavso.files 
    reader.addEventListener("load", () => {
        dataAAVSO = []
        let dataLines = reader.result.split("\n")
        dataLines.forEach(l => {
            if (l.indexOf("Vis") == 0) {
                let cols = l.split(" ## ")
                let star = cols[1]
                
                if(regexp.test(cols[1])) {
                    let star_orig = cols[1].match(regexp)[0]
                    let new_star = "V" + pad(star_orig.replace("V","") ,4)
                    star = star.replace(star_orig, new_star)
                }
                dataAAVSO.push({
                    STAR: star ,
                    JD: parseFloat(cols[3].substring(0,12)), //parseFloat(parseFloat(cols[3]).toFixed(4)), //parseFloat(cols[3]),
                    //FAINTER: cols[3] == 1 ? "<" : "",
                    MAG: (cols[4] == "1" ? "<" : "") + cols[5], //parseFloat(cols[5]),
                    COMMENTCODE: cols[6],
                    COMP1: cols[10] == "" ? "" : parseInt(cols[10]),
                    COMP2: cols[12] == "" ? "" : parseInt(cols[12]),
                    MAP: cols[14],
                    COMMENT: undefined,
                    raw: l,
                    INVCSSZ: false
                })
            }
        })
        console.log(dataAAVSO)
        content_aavso.innerHTML = "Loaded " + dataAAVSO.length + " observations."

        if(dataAAVSO.length > 0 && dataVCSSZ.length > 0) {
            btn_compare.removeAttribute("disabled")
        }
    }, false);

    if (file_aavso) {
        reader.readAsText(file_aavso)
    }
}
in_file_aavso.addEventListener("change", processAAVSO)


function compareData() {
    btn_compare.setAttribute("disabled", "disabled")
    dataToAAVSO = []
    dataToVCSSZ = []
    dataVCSSZ.forEach(v => {
        dataAAVSO.every(a => {
            if(a.JD == v.JD && a.STAR == v.STAR) {
                v.INAAVSO = true
                return false
            }
            return true
        })
    })

    dataAAVSO.forEach(a => {
        dataVCSSZ.every(v => {
            if(a.JD == v.JD && a.STAR == v.STAR) {
                a.INVCSSZ = true
                return false
            }
            return true
        })
    })

    dataToAAVSO = dataVCSSZ.filter(r => r.INAAVSO == false)
    dataToVCSSZ = dataAAVSO.filter(r => r.INVCSSZ == false)

    console.log("in VCSSZ not in AAVSO", dataToAAVSO)
    console.log("in AAVSO not in VCSSZ", dataToVCSSZ)

    var table_vcssz = new Tabulator("#observations_vcssz", {
        data: dataVCSSZ, //assign data to table
        height:"311px",
        layout:"fitColumns",
        columns: [
            {title:"#", field:"STAR", formatter:"rownum", width: 40},
            {title:"Csillag", field:"STAR", headerFilter:"input", width: 200},
            {title:"JD", field:"JD", headerFilter:"input", width:110},
            {title:"Mag.", field:"MAG", headerFilter:"input", width: 70},
            {title:"ÖH1", field:"COMP1", headerFilter:"input", width: 70},
            {title:"ÖH2", field:"COMP2", headerFilter:"input", width: 70},
            {title:"Térkép kód", field:"MAP", headerFilter:"input"},
            {title:"Megj. kód", field:"COMMENTCODE", headerFilter:"input"},
            {title:"AAVSO-ban?", field:"INAAVSO", headerFilter:"input", formatter:"tickCross"},
        ]
    });

    table_vcssz.on("dataLoaded", function(data){
        var el = document.getElementById("num_total_vcssz");
        el.innerHTML = data.length;
    });
    table_vcssz.on("dataFiltered", function(filters, rows){
        var el = document.getElementById("num_filtered_vcssz");
        el.innerHTML = rows.length;
    });

    var table_aavso = new Tabulator("#observations_aavso", {
        data: dataAAVSO, //assign data to table
        height:"311px",
        layout:"fitColumns",
        columns: [
            {title:"#", field:"STAR", formatter:"rownum", width: 40},
            {title:"Csillag", field:"STAR", headerFilter:"input", width: 200},
            {title:"JD", field:"JD", headerFilter:"input", width:110},
            {title:"Mag.", field:"MAG", headerFilter:"input", width: 70},
            {title:"ÖH1", field:"COMP1", headerFilter:"input", width: 70},
            {title:"ÖH2", field:"COMP2", headerFilter:"input", width: 70},
            {title:"Térkép kód", field:"MAP", headerFilter:"input"},
            {title:"Megj. kód", field:"COMMENTCODE", headerFilter:"input"},
            {title:"VCSSZ-ben?", field:"INVCSSZ", headerFilter:"input", formatter:"tickCross"},
        ]
    });

    table_aavso.on("dataLoaded", function(data){
        var el = document.getElementById("num_total_aavso");
        el.innerHTML = data.length;
    });
    table_aavso.on("dataFiltered", function(filters, rows){
        var el = document.getElementById("num_filtered_aavso");
        el.innerHTML = rows.length;
    });

    

    btn_compare.removeAttribute("disabled")
}
btn_compare.addEventListener("click", compareData)


function reset() {
    in_file_aavso.value = ""
    in_file_vcssz.value = ""

    content_aavso.innerText = ""
    content_vcssz.innerText = ""

    document.getElementById("observations_aavso").innerHTML = ""
    document.getElementById("observations_vcssz").innerHTML = ""

    btn_compare.setAttribute("disabled", "true")
}
btn_reset.addEventListener("click", reset)