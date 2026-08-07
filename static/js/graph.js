let selectedDays = 1;
const ctx = document.getElementById("graphCanvas").getContext("2d");

let chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: "index",
            intersect: false
        },
        plugins: {
            legend: {
                display: true
            }
        }
    }
});

async function updateGraph() {

    const response = await fetch(`/powermeter/history?days=${selectedDays}`);
    const data = await response.json();

    chart.data.labels = data.labels;

    switch (graphType) {

        case "voltage":

            chart.data.datasets = [
                {
                    label: "Phase A",
                    data: data.va,
                    borderColor: "#ff6384"
                },
                {
                    label: "Phase B",
                    data: data.vb,
                    borderColor: "#36a2eb"
                },
                {
                    label: "Phase C",
                    data: data.vc,
                    borderColor: "#4bc0c0"
                }
            ];
            break;

        case "current":

            chart.data.datasets = [
                {
                    label: "Phase A",
                    data: data.ia,
                    borderColor: "#ff6384"
                },
                {
                    label: "Phase B",
                    data: data.ib,
                    borderColor: "#36a2eb"
                },
                {
                    label: "Phase C",
                    data: data.ic,
                    borderColor: "#4bc0c0"
                }
            ];
            break;

        case "power":

            chart.data.datasets = [
                {
                    label: "Phase A",
                    data: data.pa,
                    borderColor: "#ff6384"
                },
                {
                    label: "Phase B",
                    data: data.pb,
                    borderColor: "#36a2eb"
                },
                {
                    label: "Phase C",
                    data: data.pc,
                    borderColor: "#4bc0c0"
                }
            ];
            break;

        case "energy":

            chart.data.datasets = [
                {
                    label: "Total Energy",
                    data: data.totalEnergy,
                    borderColor: "#ff6384"
                }
            ];
            break;
    }

    chart.update();
}

document.querySelectorAll(".range-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".range-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedDays = button.dataset.days;

        updateGraph();

    });

});

updateGraph();
setInterval(updateGraph, 2000);
