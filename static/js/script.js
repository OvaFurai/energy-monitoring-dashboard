// -----------------------------
// Live Clock
// -----------------------------
function updateClock() {

    const now = new Date();

    document.getElementById("clock").innerHTML =
        now.toLocaleTimeString();

}

setInterval(updateClock,1000);

updateClock();
// -----------------------------
// Status
// -----------------------------

let online = false;
// -----------------------------
// Card Elements
// -----------------------------

const voltageText = document.getElementById("voltage");

const currentText = document.getElementById("current");

const powerText = document.getElementById("power");

const energyText = document.getElementById("energy");

const frequencyText = document.getElementById("frequency");

const pfText = document.getElementById("pf");

const connection = document.getElementById("connection");


// -----------------------------
// Fetch Latest Sensor Data
// -----------------------------

async function getData(){

    try{

        const response = await fetch("/data");

        const data = await response.json();

        voltageText.innerHTML =
        Number(data.voltage).toFixed(2);

        currentText.innerHTML =
        Number(data.current).toFixed(3);

        powerText.innerHTML =
        Number(data.power).toFixed(2);

        energyText.innerHTML =
        Number(data.energy).toFixed(3);

        frequencyText.innerHTML =
        Number(data.frequency).toFixed(1);

        pfText.innerHTML =
        Number(data.pf).toFixed(2);

        connection.innerHTML = "ONLINE";

        online = true;

    }

    catch(error){

        connection.innerHTML = "OFFLINE";

        online = false;

        console.log(error);

    }

}

setInterval(getData,1000);

getData();


// ==========================================
// CHART SETTINGS
// ==========================================

function chartOptions(label,color){

    return{

        type:'line',

        data:{

            labels:[],

            datasets:[{

                label:label,

                data:[],

                borderColor:color,

                backgroundColor:color,

                borderWidth:3,

                tension:0.35,

                fill:false,

                pointRadius:0

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            animation:false,

            plugins:{

                legend:{

                    labels:{

                        color:"white"

                    }

                }

            },

            scales:{

                x:{

    ticks:{
        color:"#d0d7e5",
        maxTicksLimit:6,
        autoSkip:true
    },

    grid:{
        color:"rgba(255,255,255,.08)"
    },

                    grid:{

                        color:"rgba(255,255,255,.08)"

                    }

                },

                y:{

                    ticks:{

                        color:"#d0d7e5"

                    },

                    grid:{

                        color:"rgba(255,255,255,.08)"

                    }

                }

            }

        }

    }

}
// ==========================================
// CREATE CHARTS
// ==========================================

const voltageChart = new Chart(

document.getElementById("voltageChart"),

chartOptions("Voltage","#00E5FF")

);


const currentChart = new Chart(

document.getElementById("currentChart"),

chartOptions("Current","#00FF99")

);


const powerChart = new Chart(

document.getElementById("powerChart"),

chartOptions("Power","#FF9800")

);


const energyChart = new Chart(

document.getElementById("energyChart"),

chartOptions("Energy","#FFD54F")

);


const frequencyChart = new Chart(

document.getElementById("frequencyChart"),

chartOptions("Frequency","#8E7DFF")

);


const pfChart = new Chart(

document.getElementById("pfChart"),

chartOptions("Power Factor","#FF4FCB")

);
// ==========================================
// FETCH GRAPH HISTORY
// ==========================================

async function updateCharts(){

    try{

        const response = await fetch("/history");

        const history = await response.json();

        updateChart(
            voltageChart,
            history.labels,
            history.voltage
        );

        updateChart(
            currentChart,
            history.labels,
            history.current
        );

        updateChart(
            powerChart,
            history.labels,
            history.power
        );

        updateChart(
            energyChart,
            history.labels,
            history.energy
        );

        updateChart(
            frequencyChart,
            history.labels,
            history.frequency
        );

        updateChart(
            pfChart,
            history.labels,
            history.pf
        );

    }

    catch(error){

        console.log(error);

    }

}

setInterval(updateCharts,1000);

updateCharts();


// ==========================================
// UPDATE CHART FUNCTION
// ==========================================

function updateChart(chart, labels, data){

    chart.data.labels = [...labels];

    chart.data.datasets[0].data = [...data];

    chart.update("none");


}
// ==========================================
// STATUS CHECK
// ==========================================

function updateStatus(){

    if(online){

        connection.style.color="#00FF88";

    }

    else{

        connection.style.color="#FF4C5C";

    }

}

setInterval(updateStatus,500);


// ==========================================
// VOLTAGE STATUS
// ==========================================

function checkVoltage(v){

    voltageText.classList.remove(
        "normal",
        "warning",
        "danger"
    );

    if(v>=210 && v<=240){

        voltageText.classList.add("normal");

    }

    else if(v>240 && v<=250){

        voltageText.classList.add("warning");

    }

    else{

        voltageText.classList.add("danger");

    }

}
// ==========================================
// CURRENT STATUS
// ==========================================

function checkCurrent(i){

    currentText.classList.remove(
        "normal",
        "warning",
        "danger"
    );

    if(i<5){

        currentText.classList.add("normal");

    }

    else if(i<10){

        currentText.classList.add("warning");

    }

    else{

        currentText.classList.add("danger");

    }

}
// ==========================================
// POWER STATUS
// ==========================================

function checkPower(p){

    powerText.classList.remove(
        "normal",
        "warning",
        "danger"
    );

    if(p<500){

        powerText.classList.add("normal");

    }

    else if(p<1000){

        powerText.classList.add("warning");

    }

    else{

        powerText.classList.add("danger");

    }

}
// ==========================================
// UPDATE STATUS COLORS
// ==========================================

setInterval(()=>{

    checkVoltage(
        parseFloat(voltageText.innerHTML)
    );

    checkCurrent(
        parseFloat(currentText.innerHTML)
    );

    checkPower(
        parseFloat(powerText.innerHTML)
    );

},1000);
// ==========================================
// CONNECTION WATCHDOG
// ==========================================

let lastConnection=Date.now();

setInterval(()=>{

    if(online){

        lastConnection=Date.now();

    }

    if(Date.now()-lastConnection>5000){

        connection.innerHTML="OFFLINE";

        connection.style.color="#FF4C5C";

    }

},1000);

console.log("⚡ Smart Energy Dashboard Ready");
// ======================================================
// Dashboard Navigation
// ======================================================

const pzemBtn = document.getElementById("pzemBtn");
const meterBtn = document.getElementById("meterBtn");

const pzemDashboard = document.getElementById("pzemDashboard");
const meterDashboard = document.getElementById("meterDashboard");

pzemBtn.addEventListener("click", () => {

    pzemDashboard.style.display = "block";
    meterDashboard.style.display = "none";

    pzemBtn.classList.add("active");
    meterBtn.classList.remove("active");

});

meterBtn.addEventListener("click", () => {

    pzemDashboard.style.display = "none";
    meterDashboard.style.display = "block";

    meterBtn.classList.add("active");
    pzemBtn.classList.remove("active");

});
// ======================================================
// Dummy Meter History
// ======================================================

let meterLabels = [];

let voltageAHistory = [];
let voltageBHistory = [];
let voltageCHistory = [];

let currentAHistory = [];
let currentBHistory = [];
let currentCHistory = [];

let powerAHistory = [];
let powerBHistory = [];
let powerCHistory = [];

let totalEnergyHistory = [];
// ======================================================
// Voltage Chart
// ======================================================

const voltage3Chart = new Chart(
document.getElementById("voltage3Chart"),
{
    type:"line",

    data:{
        labels:meterLabels,
        datasets:[
        {

          label:"Phase A",

          data:voltageAHistory,

          borderColor:"#3b82f6",

          backgroundColor:"#3b82f6",

          borderWidth:2,

          pointRadius:0,

          tension:.35

        },
        {
            label:"Phase B",
            data:voltageBHistory,
            borderColor:"#22c55e",
            backgroundColor:"#22c55e",
            borderWidth:2,
            pointRadius:0,
            tension:.35
        },
        {
            label:"Phase C",
            data:voltageCHistory,
            borderColor:"#f59e0b",
            backgroundColor:"#f59e0b",
            borderWidth:2,
            pointRadius:0,
            tension:.35
        }]
    },

    options:{

    responsive:true,

    maintainAspectRatio:false,

    animation:false,

    interaction:{
        mode:"index",
        intersect:false
    },

    plugins:{
        legend:{
            labels:{
                color:"#ffffff"
            }
        }
    },

    scales:{

        x:{
            ticks:{
                color:"#d1d5db"
            },
            grid:{
                color:"rgba(255,255,255,.08)"
            }
        },

        y:{
            ticks:{
                color:"#d1d5db"
            },
            grid:{
                color:"rgba(255,255,255,.08)"
            }
        }

    }

}

});
// ======================================================
// Current Chart
// ======================================================

const current3Chart = new Chart(
document.getElementById("current3Chart"),
{
    type:"line",

    data:{
        labels:meterLabels,
        datasets:[
        {
            label:"Phase A",
            data:currentAHistory
        },
        {
            label:"Phase B",
            data:currentBHistory
        },
        {
            label:"Phase C",
            data:currentCHistory
        }]
    },

    options:{
        responsive:true,
        maintainAspectRatio:false
    }

});
// ======================================================
// Power Chart
// ======================================================

const power3Chart = new Chart(
document.getElementById("power3Chart"),
{
    type:"line",

    data:{
        labels:meterLabels,
        datasets:[
        {
            label:"Phase A",
            data:powerAHistory
        },
        {
            label:"Phase B",
            data:powerBHistory
        },
        {
            label:"Phase C",
            data:powerCHistory
        }]
    },

    options:{
        responsive:true,
        maintainAspectRatio:false
    }

});
// ======================================================
// Energy Chart
// ======================================================

const energy3Chart = new Chart(
document.getElementById("energy3Chart"),
{
    type:"line",

    data:{
        labels:meterLabels,
        datasets:[
        {
            label:"Total Energy",
            data:totalEnergyHistory
        }]
    },

    options:{
        responsive:true,
        maintainAspectRatio:false
    }

});
// ======================================================
// Dummy 3 Phase Generator
// ======================================================

let totalEnergy = 12.000;

async function updateDummyMeter()
{
    const response = await fetch("/powermeter/data");
    const data = await response.json();

    document.getElementById("va").innerHTML = data.va.toFixed(1);
    document.getElementById("vb").innerHTML = data.vb.toFixed(1);
    document.getElementById("vc").innerHTML = data.vc.toFixed(1);

    document.getElementById("ia").innerHTML = data.ia.toFixed(2);
    document.getElementById("ib").innerHTML = data.ib.toFixed(2);
    document.getElementById("ic").innerHTML = data.ic.toFixed(2);

    document.getElementById("pa").innerHTML = data.pa.toFixed(1);
    document.getElementById("pb").innerHTML = data.pb.toFixed(1);
    document.getElementById("pc").innerHTML = data.pc.toFixed(1);

    document.getElementById("ea").innerHTML = data.ea.toFixed(3);
    document.getElementById("eb").innerHTML = data.eb.toFixed(3);
    document.getElementById("ec").innerHTML = data.ec.toFixed(3);

    document.getElementById("totalPower").innerHTML = data.totalPower.toFixed(1);
    document.getElementById("totalEnergy").innerHTML = data.totalEnergy.toFixed(3);

    document.getElementById("avgPF").innerHTML = data.pf.toFixed(2);
    document.getElementById("meterFreq").innerHTML = data.frequency.toFixed(1);

    meterLabels.push(
    new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
    })
);

    voltageAHistory.push(data.va);
    voltageBHistory.push(data.vb);
    voltageCHistory.push(data.vc);

    currentAHistory.push(data.ia);
    currentBHistory.push(data.ib);
    currentCHistory.push(data.ic);

    powerAHistory.push(data.pa);
    powerBHistory.push(data.pb);
    powerCHistory.push(data.pc);

    totalEnergyHistory.push(data.totalEnergy);

    if (meterLabels.length > 20)
    {
        meterLabels.shift();

        voltageAHistory.shift();
        voltageBHistory.shift();
        voltageCHistory.shift();

        currentAHistory.shift();
        currentBHistory.shift();
        currentCHistory.shift();

        powerAHistory.shift();
        powerBHistory.shift();
        powerCHistory.shift();

        totalEnergyHistory.shift();
    }

    voltage3Chart.update();
    current3Chart.update();
    power3Chart.update();
    energy3Chart.update();
}

setInterval(updateDummyMeter, 2000);
updateDummyMeter();
// ======================================================
// Smooth Scroll for Graph Links
// ======================================================

document.querySelectorAll(".graph-link").forEach(link=>{

    link.addEventListener("click",function(e){

        e.preventDefault();

        const target=document.querySelector(
            this.getAttribute("href")
        );

        target.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

    });

});