const TABLEID = '310961';

let watched = [];

let selectedRowId = null; // store the ID of the row being clicked 

//filter from searchBar
function filterResults(query) { 
    const filteredResults = watched.filter(result => {
        return result.Title.toLowerCase().includes(query.toLowerCase()) ||
               result.Genre.toLowerCase().includes(query.toLowerCase()) ||
               result["Movie or TV"].toLowerCase().includes(query.toLowerCase());
    });
    displayResults(filteredResults);
}


// results from the search bar
function displayResults(results) {
    const ol = document.getElementById('dataList')
    ol.innerHTML = '';
    results.forEach(result => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="title">${result.Title}</div>
            <div class="details">
                <div><strong>Genre:</strong> ${result.Genre}</div>
                <div><strong>Movie or TV:</strong> ${result["Movie or TV"]}</div>
                <div><strong>Rating:</strong> ${getStars(result.Rating)}</div>
                <div><strong>Date:</strong> ${result.Date}</div>
            </div>
            <div class="button-container">
                <button class="button updateButton">Update</button>
                <button class="button deleteButton">Delete</button>
            </div>
        `;

        li.querySelector('.updateButton').addEventListener('click', () => {
            selectedRowId = result.id;
            showUpdateModal(result);
        });

        li.querySelector('.deleteButton').addEventListener('click', () => {
            selectedRowId = result.id;
            showDeleteModal();
        });
        
        ol.appendChild(li)
    })
}

async function listRows(orderField = 'Date') {
    try {
        const response = await axios ({
            method: "GET",
            url: `http://localhost:3000/api/rows?orderField=${orderField}&tableId=${TABLEID}`
        });
        watched = response.data;
        console.log("Recieved rows:, ", watched);

        displayResults(watched);
    } catch(error) {
        console.log("Error fetching rows: ", error);
    }
}

function getStars(urgency) {
    let stars = '';
    for(let i = 0; i < urgency; i++) {
        stars += '⭐';
    }
    return stars
}


function showUpdateModal(result) {
    document.getElementById('updateGenre').value = result.Genre;
    document.getElementById('updateTitle').value = result.Title;
    document.getElementById('updateMovieOrTV').value = result["Movie or TV"];
    document.getElementById('updateRating').value = result.Rating;
    document.getElementById('updateModal').style.display = 'block';
}

function submitUpdate() {
    const updateData = {
        "Genre": document.getElementById('updateGenre').value,
        "Title": document.getElementById('updateTitle').value,
        "Movie or TV": document.getElementById('updateMovieOrTV').value,
        "Rating": document.getElementById('updateRating').value,
        "Date": new Date().toISOString().split('T')[0], // current date
    };

    axios({
        method: 'PATCH', 
        url: `http://localhost:3000/api/submit/${TABLEID}/${selectedRowId}`,
        headers: {
            "Content-Type": "application/json"
        },
        data: updateData
    }).then(response => {
        document.getElementById("updateModal").style.display = 'none';
        listRows(); // list the new rows post update
    }).catch(error => {
        console.error("Error updating row: ", error.response ? error.response.data : error.message);
    });
}

function showDeleteModal() {
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    axios({
        method: 'DELETE',
        url: `http://localhost:3000/api/submit/${selectedRowId}`,
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        document.getElementById('deleteModal').style.display = 'none';
        listRows();
    }).catch(error => {
        console.error("Error deleting row: ", error.response ? error.response.data : error.message);
    });
}


// Event listener for the order button
document.getElementById('orderButton').addEventListener('click', () => {
    const orderField = document.getElementById('orderSelect').value; 
    listRows(orderField);
});

// event listener for the search bar 
document.getElementById('searchBar').addEventListener('input', function () {
    filterResults(this.value);
});

document.getElementById('updateClose').addEventListener('click', () => {
    document.getElementById('updateModal').style.display = 'none';
});

document.getElementById('updateButton').addEventListener('click', submitUpdate);

document.getElementById('deleteClose').addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'none';
});

document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteModal').style.display = 'none';
});


// initial call 
document.addEventListener("DOMContentLoaded", (event) => {
    listRows();
});