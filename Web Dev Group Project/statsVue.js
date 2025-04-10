const app = Vue.createApp({
    data() {
        return {

        }
    }
}).mount('#app')

function updateStatsVue(result) {
    fetch('http://localhost:3000/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, result })
    })
    .then(res => res.json())
    .then(data => {
        //console.log('Full response from server:', data);
        renderStats(data.stats);
    });
}

function renderStatsVue(statsObj) {
    if (!statsObj) return;

    $(`#${difficulty.toLowerCase()}-wins`).text(statsObj.wins);
    $(`#${difficulty.toLowerCase()}-losses`).text(statsObj.losses);
    $(`#${difficulty.toLowerCase()}-winstreak`).text(statsObj.winstreak);
}