let pokemons = [];
let urlTotal = [];
let pokemon = [];


async function init() {
    const url = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=15";
    let pokemonList = await fetch(url);
    pokemons = await pokemonList.json();

    extractPokemonUrls();
    await loadPokemonData();
    render();
    search();
}


function search() {
    let input = document.getElementById('search-input');
    input.addEventListener("input", () => {
        let filter, card, name, i;
        filter = input.value.toUpperCase();
        card = document.getElementsByClassName('card');
        for (i = 0; i < card.length; i++) {
            name = card[i].getElementsByTagName('h4')[0];
            if (name.innerHTML.toUpperCase().indexOf(filter) > -1) {
                card[i].style.display = "";
            } else {
                card[i].style.display = "none";
            }
        }
    });
}


function extractPokemonUrls() {
    for (let i = 0; i < pokemons.results.length; i++) {
        pokemon.push(pokemons.results[i].url);
    }
}


async function loadPokemonData() {
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    progressBar.max = pokemon.length;
    let loadedCount = 0;

    for (let i = 0; i < pokemon.length; i++) {
        let url = pokemon[i];
        let isLoaded = await isURLFullyLoaded(url);
        if (isLoaded) {
            await loadPokemonDetails(url);
            loadedCount++;
            updateProgressBar(loadedCount);
        } else {
            console.log(`URL ${url} konnte nicht vollständig geladen werden.`);
        }
    }

    progress.classList.add('none');
}


async function loadPokemonDetails(url) {
    let pokemonList = await fetch(url);
    urlTotal.push(await pokemonList.json());
}


function updateProgressBar(loadedCount) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${loadedCount / pokemon.length * 100}%`;
    progressBar.value = loadedCount;
}


async function isURLFullyLoaded(url) {
    try {
        await fetch(url);
        return true;
    } catch (error) {
        return false;
    }
}


function render() {
    let content = document.getElementById('content');  
    content.innerHTML = '';
    let i = 0;
    pokemons.results.forEach(pokemon => {  
        content.innerHTML += /*html*/ `
            <div onclick="showModal(${i})" class="card">
                <h4><b>${pokemon.name}</b></h4>
                <img src="${urlTotal[i].sprites.other['official-artwork']['front_shiny']}">
                <div id="podest${i}" class="podest"></div>
            </div>
        `;
        renderPodest(i);
        i++;
    }); 
    
    
}


function renderPodest(i) {
    let podest = document.getElementById(`podest${i}`);
    if(urlTotal[i].types[0].type.name == "grass") {
        podest.style.backgroundColor = "green";
    } else if(urlTotal[i].types[0].type.name == "fire") {
        podest.style.backgroundColor = "red";
    } else if(urlTotal[i].types[0].type.name == "water") {
        podest.style.backgroundColor = "blue";
    } else if(urlTotal[i].types[0].type.name == "bug") {
        podest.style.backgroundColor = "yellow";
    } else if(urlTotal[i].types[0].type.name == "normal") {
        podest.style.backgroundColor = "grey";
    }else{
        podest.style.backgroundColor = "black";
    }
}


function showModal(i) {
    let modal = document.getElementById("modal");
    modal.classList.remove("none");
    modal.innerHTML = '';
    modal.innerHTML += generateModalContent(i);
    modalCart(i);
}


function generateModalContent(i) {
    const pokemon = urlTotal[i];
    return /*html*/ `
        <div class="modal-content">
            <span onclick="prePockemon(${i})" class="pre"><</span>
            <span onclick="nextPokemon(${i})" class="next">></span>
            <span onclick="closeModal()" class="close">&times;</span>
            <h4 class="name"><b>${pokemon.name}</b></h4>
            <div class="modalBody">
                <div class="modalSpakts">
                    <img class="modalImg" src="${pokemon.sprites.other['official-artwork']['front_shiny']}">
                    <div>
                        <p>Height: ${pokemon.height}</p>
                        <p>Weight: ${pokemon.weight}</p>
                        <p>Base experience: ${pokemon.base_experience}</p>
                        <p>Abilities: ${pokemon.abilities[0].ability.name}</p>
                        <p>Types: ${pokemon.types[0].type.name}</p>
                    </div>
                </div>
                <canvas id="myChart" width="200" height="200"></canvas>
            </div>
        </div>`;
}


function nextPokemon(i) {
    if (i < urlTotal.length - 1) {
        i++;
        showModal(i);
    }
}

function prePockemon(i) {
    if (i > 0) {
        i--;
        showModal(i);
    }
}



function closeModal() {
    let modal = document.getElementById("modal");
    modal.classList.add("none");
}


function modalCart(i) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const data = getChartData(i);
    const options = getChartOptions();
    createChart(ctx, data, options);
}


function getChartData(i) {
    const stats = urlTotal[i].stats;
    const labels = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];
    const data = stats.map(stat => stat.base_stat);
    const backgroundColors = ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'];
    const borderColors = ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'];

    return {
        labels: labels,
        datasets: [{
            label: '# of Pokemon',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 3
        }]
    };
}


function getChartOptions() {
    return {
        scales: {
            r: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };
}


function createChart(ctx, data, options) {
    new Chart(ctx, {
        type: 'polarArea',
        data: data,
        options: options
    });
}
