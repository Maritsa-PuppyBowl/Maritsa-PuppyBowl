const playerContainer = document.getElementById("all-players-container");
const newPlayerFormContainer = document.getElementById("new-player-form");

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = "2308-FTB-ET-WEB-PT";
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
let players = [];

const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${APIURL}/players`);
    const players = await response.json();
    console.log("players", players);
    return players.data.players;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};
// console.log(fetchAllPlayers);

const fetchSinglePlayer = async (id) => {
  try {
    const response = await fetch(`${APIURL}/players/${id}`);
    const info = await response.json();
    console.log("info", info);
    return info.data.player;
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${id}!`, err);
  }
};

const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${APIURL}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerObj),
    });
    const newPlayer = await response.json();
    console.log("newPlayer", newPlayer);
    return newPlayer.data.newPlayer;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

const removePlayer = async (playerId) => {
  try {
    const response = await fetch(`${APIURL}/players/${playerId}`, {
      method: "DELETE",
    });
    const remove = await response.json();
    console.log("remove", remove);
    return;
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players.
 *
 * Then it takes that larger string of HTML and adds it to the DOM.
 *
 * It also adds event listeners to the buttons in each player card.
 *
 * The event listeners are for the "See details" and "Remove from roster" buttons.
 *
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player.
 *
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster.
 *
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
  try {
    playerContainer.innerHTML = "";
    playerList.forEach((players) => {
      const playerContainerHTML = document.createElement("div");
      playerContainerHTML.classList.add("player");
      playerContainerHTML.innerHTML = `
      <h2>${players.name}</h2>
      <p>${players.breed}</p>
      <p>${players.status}</p>
      <p>${players.id}</p>
      <img src="${players.imageUrl}"/>
      
      <button class="details-button">See Details</button> <button class="delete-button">Delete</button>`;
      const detailsButton =
        playerContainerHTML.querySelector(".details-button");
      detailsButton.addEventListener("click", async () => {
        const player = await fetchSinglePlayer(players.id);
        // console.log(player);
        renderSinglePlayer(player);
      });
      const deleteButton = playerContainerHTML.querySelector(".delete-button");
      deleteButton.addEventListener("click", async () => {
        try {
          await removePlayer(players.id);
          const nextPlayers = await fetchAllPlayers();
          renderAllPlayers(nextPlayers);
        } catch (err) {
          console.error(err);
        }
      });
      playerContainer.appendChild(playerContainerHTML);
    });
  } catch (err) {
    console.error(err);
  }
};

async function renderSinglePlayer(player) {
  try {
    console.log(player);
    playerContainer.innerHTML = "";
    const playerContainerHTML = document.createElement("div");
    playerContainerHTML.classList.add("player");
    playerContainerHTML.innerHTML = `
      <h2>${player.name}</h2>
      <p>${player.breed}</p>
      <p>${player.status}</p>
      <p>${player.id}</p>
      <img src="${player.imageUrl}"/>
     `;

    playerContainer.appendChild(playerContainerHTML);
  } catch (err) {
    console.error(err);
  }
}

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = async () => {
  try {
    const playerForm = document.createElement("form");

    playerForm.innerHTML = `
    <label for="player-name">Name:</label>
    <input name="playr-name" id="player-name" />
    
    <label for="player-breed">Breed:</label>
    <input name="playr-breed" id="player-breed" />

    <button type="submit" class="add-player">Add Puppy</button>
    `;

    playerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const playerName = document.getElementById("player-name").value;
      const playerBreed = document.getElementById("player-breed").value;
      try {
        await addNewPlayer({ name: playerName, breed: playerBreed });
        const players = await fetchAllPlayers();
        renderAllPlayers(players);
      } catch (err) {
        console.error("Uh, oh, trouble adding new player!");
      }
    });
    newPlayerFormContainer.appendChild(playerForm);
  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);

  renderNewPlayerForm();
};

init();
