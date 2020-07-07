$(document).ready(function () {
  // ////////////////////////////////////////////////////////////////initialize charts so we can use chart functions outside of response

  // let chart = new Chart(ctx, {
  //   type: "bar",
  // });
  // initialize popovers
  const ctx = document.getElementById("topChart").getContext("2d");
  const doughnutCTX = document.getElementById("doughnutChart").getContext("2d");
  const lineCTX = document.getElementById("lineChart").getContext("2d");

  $('[data-toggle="popover"]').popover();

  // // Function that populates side menu with list of RAWG platform names and sets data-ids equal to the rawg id number for platform
  const populatePlatformList = () => {

    const platformUrl = `https://api.rawg.io/api/platforms`;

    $.get(platformUrl).then((response) => {
      // console.log(response.results);

      let platforms = response.results

      for (let i = 0; i < platforms.length; i++) {
        // console.log(platforms[i].name);

        const displayPlatformName = $("<a>", {
          class: "dropdown-item platform-item",
          type: "button",
          "data-id": platforms[i].id,
          name: platforms[i].name,

          text: platforms[i].name,
        });


        $(".platform-list").append(displayPlatformName);
      }
    });

  }

  populatePlatformList();


  $(".platform-list").on("click", "a", function () {

    $(".platform:first-child").text($(this).text());
    $(".platform:first-child").val($(this).data("id"));
    $(".platform:first-child").attr("name", $(this).text());
  });


  $(".order-list").on("click", "a", function () {
    $(".order:first-child").text($(this).text());
    // $(".browse:first-child").val($(this).data("id"));
    $(".order:first-child").attr("name", $(this).text());

  });

  $("#search-button").on("click", function (event) {
    event.preventDefault();

    $("#game-area").html("");

    $("#chart-button").prop('disabled', true);


    let gameName = $("#searchInput").val().trim();


    if (gameName === "") {
      $("#alert-modal").modal("show");
      $("#modal-text").text(`No results please try again`);
    } else {
      $("#game-area")
        .css("background-color", "rgba(12, 0, 50, .7)")
        .css("border-radius", "5px");

      // gameSlug = gameName.replace(/\s+/g, '-').toLowerCase();

      renderSingleGame(gameName);
    }
  });

  $("#browse-btn").on("click", function (event) {
    event.preventDefault();

    $("#game-area").html("");

    $("#chart-button").prop('disabled', false);

    let platformId = $(".platform").val();
    // console.log(platformId);
    function renderChartID() {
      chartID.pop();
      chartID.push(platformId);
    }
    renderChartID();
    let platformName = $(".platform").attr("name");

    let yearInput = $("#yearInput").val().trim();
    // console.log(yearInput)
    let ordering = $(".order").attr("name").toLowerCase();
    // console.log(ordering)
    function chartTitle() {
      title.pop();
      title.push(platformName);
    }
    chartTitle();
    $("#game-area")
      .css("background-color", "rgba(12, 0, 50, .7)")
      .css("border-radius", "5px");

    if (yearInput === "") {
      renderGameGridPlatOrder(platformId, ordering);
    } else if (platformId === "") {
      renderGameGridYearOrder(yearInput, ordering);
    } else {
      renderGameGridAll(platformId, yearInput, ordering);
    }
  });

  const renderGameGridAll = (id, year, ordering) => {
    let gamesURL = `https://rawg.io/api/games?platforms=${id}&dates=${year}-01-01,${year}-12-31&ordering=-${ordering}&page_size=50`;

    // console.log(gamesByPlatformURL);
    $.get(gamesURL).then((response) => {
      console.log(response);
      renderCharts();
      if (response.count === 0) {
        $("#alert-modal").modal("show");
        $("#modal-text").text(`No results please try again`);
      } else {
        const game = response.results;

        // for loop to dynamically create and display a) Card/Card components and b) game data we want displayed to each card
        for (let i = 0; i < game.length; i++) {
          // variable to create card
          const createCard = $("<div>", {
            class: "card d-inline-block",
            style: "width: 21rem",

          });
          // append card to parent div (line 55 of addGame.html)
          $("#game-area").append(createCard);

          // if game has no background image fill card image with a placekitten holder (not permanent just TEMPORARY)
          if (game[i].background_image === null) {
            const cardImg = $("<img>", {
              class: "card-img-top",
              alt: "game-image",

              src: "https://placekitten.com/200/139",

            });
            createCard.append(cardImg);
          } else {
            // else fill card image with the game's background-image  from API
            const cardImg = $("<img>", {
              class: "img-thumbnail",
              alt: "game-image",

              src: game[i].background_image,

            });
            createCard.append(cardImg);
          }

          // variable to create card body div
          const cardBody = $("<div>", {

            class: "card-body m-auto",

          });
          // append card body to parent .card div
          createCard.append(cardBody);


          // variable to display game title
          const cardTitle = $("<h6>", {
            class: "card-title text-center",
            text: game[i].name,

          });
          // append card title to card body
          cardBody.append(cardTitle);

          // if game year is null set card description (release year) to N/A and append to card body
          if (game[i].released === null) {
            const cardDescription = $("<p>", {
              class: "card-text text-center",

              text: `Released: N/A`,

            });
            cardBody.append(cardDescription);
          } else {
            // else set card description to game release year and append to card body
            const gameYear = game[i].released.split("-");

            const cardDescription = $("<p>", {
              class: "card-text text-center",

              text: `Released: ${gameYear[0]}`,

            });
            cardBody.append(cardDescription);
          }

          // variables to set RAWG rating to card body

          const percentage = Math.round((game[i].rating / 5) * 100);

          const rawgPercentage = $("<p>", {
            class: "card-text text-center",

            text: `Rating: ${percentage}%`,
          });

          const rawgRating = $("<p>", {
            class: "card-text text-center mx-auto",
          }).rateYo({
            rating: game[i].rating,
            readOnly: true,
            starWidth: "25px",
          });

          const userRatings = $("<p>", {
            class: "card-text text-center",
            text: `User Ratings: ${game[i].ratings_count}`,
          });

          cardBody.append(rawgPercentage, rawgRating, userRatings);

          // variable to create button that will add game to "favorites" library
          const addButton = $("<button>", {
            class: "btn btn-outline-secondary btn-block text-white",
            id: "add-to-favorites-button",
            type: "button",
            "data-type": game[i].id,
            "data-name": game[i].slug,
            "data-toggle": "popover",
            "data-content": "Game added to library",
            text: `Add to Library`,
          });

          // append button to card body
          cardBody.append(addButton);
        }
      }
    });
    // });
  };

  const renderGameGridPlatOrder = (id, ordering) => {
    let gamesURL = `https://rawg.io/api/games?platforms=${id}&ordering=-${ordering}`;

    $.get(gamesURL).then((response) => {
      // console.log(response);
      renderCharts();

      if (response.count === 0) {
        $("#alert-modal").modal("show");
        $("#modal-text").text(`No results please try again`);
      } else {
        const game = response.results;

        // for loop to dynamically create and display a) Card/Card components and b) game data we want displayed to each card
        for (let i = 0; i < game.length; i++) {
          // variable to create card
          const createCard = $("<div>", {
            class: "card d-inline-block mr-3 mt-3",
            style: "width: 21rem",

          });
          // append card to parent div (line 55 of addGame.html)
          $("#game-area").append(createCard);

          // if game has no background image fill card image with a placekitten holder (not permanent just TEMPORARY)
          if (game[i].background_image === null) {
            const cardImg = $("<img>", {
              class: "card-img-top",
              alt: "game-image",

              src: "https://placekitten.com/200/139",

            });
            createCard.append(cardImg);
          } else {
            // else fill card image with the game's background-image  from API
            const cardImg = $("<img>", {
              class: "img-thumbnail",
              alt: "game-image",

              src: game[i].background_image,

            });
            createCard.append(cardImg);
          }

          // variable to create card body div
          const cardBody = $("<div>", {

            class: "card-body m-auto",
          });
          // append card body to parent .card div
          createCard.append(cardBody);

          // variable to display game title
          const cardTitle = $("<h6>", {
            class: "card-title text-center",
            text: game[i].name,
          });
          // append card title to card body
          cardBody.append(cardTitle);

          // if game year is null set card description (release year) to N/A and append to card body
          if (game[i].released === null) {
            const cardDescription = $("<p>", {
              class: "card-text text-center",
              text: `Released: N/A`,
            });
            cardBody.append(cardDescription);
          } else {
            // else set card description to game release year and append to card body
            const gameYear = game[i].released.split("-");

            const cardDescription = $("<p>", {
              class: "card-text text-center",
              text: `Released: ${gameYear[0]}`,
            });
            cardBody.append(cardDescription);
          }

          // variables to set RAWG rating to card body

          const percentage = Math.round((game[i].rating / 5) * 100);

          const rawgPercentage = $("<p>", {
            class: "card-text text-center",
            text: `Rating: ${percentage}%`,
          });

          const rawgRating = $("<p>", {
            class: "card-text text-center mx-auto",
          }).rateYo({
            rating: game[i].rating,
            readOnly: true,
            starWidth: "25px",
          });

          const userRatings = $("<p>", {
            class: "card-text text-center",
            text: `User Ratings: ${game[i].ratings_count}`,
          });


          cardBody.append(rawgPercentage, rawgRating, userRatings);

          // variable to create button that will add game to "favorites" library
          const addButton = $("<button>", {
            class: "btn btn-outline-secondary btn-block text-white",
            id: "add-to-favorites-button",
            type: "button",
            "data-type": game[i].id,
            "data-name": game[i].slug,
            "data-toggle": "popover",
            "data-content": "Game added to library",

            text: `Add to Library`,

          });

          // append button to card body
          cardBody.append(addButton);
        }
      }
    });

  };


  const renderGameGridYearOrder = (year, ordering) => {
    let gamesURL = `https://rawg.io/api/games?dates=${year}-01-01,${year}-12-31&ordering=-${ordering}`;

    $.get(gamesURL).then((response) => {
      // console.log(response);

      renderCharts();

      if (response.count === 0) {
        $("#alert-modal").modal("show");
        $("#modal-text").text(`No results please try again`);
      } else {

        const game = response.results;

        // for loop to dynamically create and display a) Card/Card components and b) game data we want displayed to each card
        for (let i = 0; i < game.length; i++) {

          // variable to create card
          const createCard = $("<div>", {
            class: "card d-inline-block mr-3 mt-3",
            style: "width: 21rem",

          });
          // append card to parent div (line 55 of addGame.html)
          $("#game-area").append(createCard);

          // if game has no background image fill card image with a placekitten holder (not permanent just TEMPORARY)
          if (game[i].background_image === null) {
            const cardImg = $("<img>", {
              class: "card-img-top",
              alt: "game-image",

              src: "https://placekitten.com/200/139",

            });
            createCard.append(cardImg);
          } else {
            // else fill card image with the game's background-image  from API
            const cardImg = $("<img>", {
              class: "img-thumbnail",
              alt: "game-image",

              src: game[i].background_image,

            });
            createCard.append(cardImg);
          }

          // variable to create card body div
          const cardBody = $("<div>", {

            class: "card-body m-auto",

          });
          // append card body to parent .card div
          createCard.append(cardBody);


          // variable to display game title
          const cardTitle = $("<h6>", {
            class: "card-title text-center",
            text: game[i].name,

          });
          // append card title to card body
          cardBody.append(cardTitle);

          // if game year is null set card description (release year) to N/A and append to card body
          if (game[i].released === null) {
            const cardDescription = $("<p>", {
              class: "card-text text-center",

              text: `Released: N/A`,

            });
            cardBody.append(cardDescription);
          } else {
            // else set card description to game release year and append to card body
            const gameYear = game[i].released.split("-");

            const cardDescription = $("<p>", {
              class: "card-text text-center",

              text: `Released: ${gameYear[0]}`,

            });
            cardBody.append(cardDescription);
          }

          // variables to set RAWG rating to card body

          const percentage = Math.round((game[i].rating / 5) * 100);

          const rawgPercentage = $("<p>", {
            class: "card-text text-center",

            text: `Rating: ${percentage}%`,

          });

          const rawgRating = $("<p>", {
            class: "card-text text-center mx-auto",
          }).rateYo({
            rating: game[i].rating,
            readOnly: true,

            starWidth: "25px",
          });

          const userRatings = $("<p>", {
            class: "card-text text-center",
            text: `User Ratings: ${game[i].ratings_count}`,
          });

          cardBody.append(rawgPercentage, rawgRating, userRatings);

          // variable to create button that will add game to "favorites" library
          const addButton = $("<button>", {
            class: "btn btn-outline-secondary btn-block text-white",
            id: "add-to-favorites-button",
            type: "button",
            "data-type": game[i].id,
            "data-name": game[i].slug,
            "data-toggle": "popover",
            "data-content": "Game added to library",
            text: `Add to Library`,
          });

          // append button to card body
          cardBody.append(addButton);
        }
      }
    });
  };

  const renderSingleGame = (searchInput) => {
    let searchURL = `https://rawg.io/api/games?search=${searchInput}`;

    $.get(searchURL).then((response) => {
      console.log(response);

      if (response.count === 0) {
        $("#alert-modal").modal("show");
        $("#modal-text").text(`No results please try again`);
      } else {
        const searchResponse = response.results;
        // variable to create card

        let slugURL = `https://rawg.io/api/games/${searchResponse[0].slug}`;

        $.get(slugURL).then((response) => {
          let slugResponse = response;

          console.log(slugResponse);

          const createCard = $("<div>", {
            class: "card text-center mx-auto",
            id: "single-card",
            style: "width: 60%;",
          });
          // append card to parent div (line 55 of addGame.html)
          $("#game-area").append(createCard);

          if (slugResponse.clip === null) {
            const cardImg = $("<img>", {
              class: "card-img-top",
              alt: "game-image",
              src: slugResponse.background_image,
            });
            createCard.append(cardImg);
          } else {
            const cardVid = $("<video>", {
              class: "card-img-top",
              type: "video/mp4",
              controls: "controls",
              alt: "game-image",
              src: slugResponse.clip.clip,
            });
            createCard.append(cardVid);
          }

          const cardBody = $("<div>", {
            class: "card-body",
          });
          createCard.append(cardBody);

          const cardTitle = $("<h5>", {
            class: "card-title text-white",
            text: slugResponse.name,
          });
          cardBody.append(cardTitle);

          const rating = $("<p>", {
            class: "card-text text-center mx-auto",
          }).rateYo({
            rating: slugResponse.rating,
            readOnly: true,
            starWidth: "25px",
          });

          cardBody.append(rating);

          const cardDescription = $("<p>", {
            class: "card-text",
            text: slugResponse.description_raw,
          });

          cardBody.append(cardDescription);

          const addButton = $("<button>", {
            class: "btn btn-outline-secondary btn-block text-white",
            id: "add-to-favorites-button",
            type: "button",
            "data-type": slugResponse.id,
            "data-name": slugResponse.slug,
            "data-toggle": "popover",
            "data-content": "Game added to library",
            text: `Add to Library`,
          });

          cardBody.append(addButton);

          const gameYear = slugResponse.released.split("-");

          const cardFooter = $("<div>", {
            class: "card-footer",
            text: `Released: ${gameYear[0]}`,
          });

          cardBody.append(cardFooter);
        });
      }
    });
  };

  $("#game-area").on("click", "button", function (event) {
    event.preventDefault();


    // variable that sets the slug to as data-name
    let gameSelect = $(this).data("name");
    // variable that sets the unique game id as the data-id
    let gameID = $(this).data("type");

    // sets game slug and unique game id as game_name and unique_id in database
    const newGame = {
      game_name: gameSelect,
      unique_id: gameID,
    };

    console.log(newGame)
    // post request to our sever to add new game to database
    $.ajax("/api/addgames", {
      type: "POST",
      data: newGame,
    })
      .then((result) => {
        // console.log(result);
        $(this).popover("show");
        setTimeout(() => {
          $(this).popover("hide");
        }, 600);
      })
      .catch((err) => {
        if (err) {
          throw err;
        }
      });
  });

  // let clearCharts = () => {
  //   $("#topChart").remove();
  //   $("#topChartCard").append($("<canvas>", { id: "topChart" }));
  // };

  // clearCharts();

  // popover chart
  // $('[data-toggle="popover"]').popover({
  //     html: true,
  //     content: '<canvas id="myChart" width="400" height="400"></canvas>',
  //   }).on('shown.bs.popover', function() {

  //     new Chart($('#myChart'), {
  //       // The type of chart we want to create
  //       type: 'line',

  //       // The data for our dataset
  //       data: {
  //         labels: ["January", "February", "March", "April", "May", "June", "July"],
  //         datasets: [{
  //           label: "My First dataset",
  //           backgroundColor: 'rgb(255, 99, 132)',
  //           borderColor: 'rgb(255, 99, 132)',
  //           data: [0, 10, 5, 2, 20, 30, 45],
  //         }]
  //       },

  //       // Configuration options go here
  //       options: {}
  //     });
  //////////////////////////////// popover js
  //   ////////////////////////////////////////////////////////////////////////////////get info for new chart
  //   //TODO: clear chart when running
  //   //TODO: update legend
  //   //TODO: get card on hover
  //   //TODO: allow changing chart type
  //   //TODO: allow addition of other data sets
  //   //TODO: switch color palette
  //   // makes main chart
  let chartID = [];
  function renderCharts() {
    id = chartID;
    $.get(
      `https://rawg.io/api/games?platforms=${id}&page_size=50&ordering=-added`
    ).then((response) => {
      let chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            response.results[0].name,
            response.results[1].name,
            response.results[2].name,
            response.results[3].name,
            response.results[4].name,
            response.results[5].name,
          ],
          datasets: [
            {
              data: [
                response.results[0].metacritic,
                response.results[1].metacritic,
                response.results[2].metacritic,
                response.results[3].metacritic,
                response.results[4].metacritic,
                response.results[5].metacritic,
              ],
              backgroundColor: colorPalette,
            },
          ],
        },
        options: {
          title: {
            display: true,
            position: "top",
            text: `Top ${title} Games in 2020`,
          },
        },
      });
      // TODO: make DONUT and LINE charts
      // donut chart
      let doughnutChart = new Chart(doughnutCTX, {
        type: "doughnut",
        data: {
          labels: [
            response.results[0].name,
            response.results[1].name,
            response.results[2].name,
            response.results[3].name,
            response.results[4].name,
            response.results[5].name,
          ],
          datasets: [
            {
              data: [
                response.results[0].metacritic,
                response.results[1].metacritic,
                response.results[2].metacritic,
                response.results[3].metacritic,
                response.results[4].metacritic,
                response.results[5].metacritic,
              ],
              backgroundColor: colorPalette,
            },
          ],
        },
        options: {
          title: {
            display: true,
            position: "top",
            text: `Top ${title} Games in 2020`,
          },
        },
      });
      // line chart
      let lineChart = new Chart(lineCTX, {
        type: "line",
        data: {
          labels: [
            response.results[0].name,
            response.results[1].name,
            response.results[2].name,
            response.results[3].name,
            response.results[4].name,
            response.results[5].name,
          ],
          datasets: [
            {
              data: [
                response.results[0].metacritic,
                response.results[1].metacritic,
                response.results[2].metacritic,
                response.results[3].metacritic,
                response.results[4].metacritic,
                response.results[5].metacritic,
              ],
              backgroundColor: colorPalette,
            },
          ],
        },
        options: {
          title: {
            display: true,
            position: "top",
            text: `Top ${title} Games in 2020`,
          },
        },
      });
    });

    // ////////////////////////////////////////////////////////////////////////////////////////// top chart logic

    const colorPalette = [
      "black",
      "#0c0032",
      "#190061",
      "#240090",
      "#3500D3",
      "#282828",
      "#00ff9f",
      "#00b8ff",
      "#001eff",
      "#bd00ff",
      "#d600ff",
    ];
    // let newData1 = [53, 52, 18, 68, 50, 38, 73];
    // let oldData = [0, 1, 10, 43, 23, 88, 23];
    // let newData = [10, 14, 18, 43, 21, 38, 63];
    // let oldData1 = [99, 80, 60, 66, 63, 18, 23];

    function updateChart() {
      chart.reset();
      chart.update();
      chart.data.datasets[0].data = newData;
      chart.data.datasets[1].data = newData1;
    }
  }
  title = [];
});

/////////////////adding chart to plat order/game order/all calls
