const TABLEID = '300853'

let allResults = []

let selectedRowId = null; // store the ID of the row being updated or deleted

// filter from searchBar
function filterResults(query) {
    const filteredResults = allResults.filter(result => {
        return result.Title.toLowerCase().includes(query.toLowerCase()) ||
               result.Genre.toLowerCase().includes(query.toLowerCase()) ||
               result["Movie or TV"].toLowerCase().includes(query.toLowerCase());
    });
    displayResults(filteredResults);
}

// results of searchBar
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
                <div><strong>Urgency:</strong> ${getExclamation(result.Urgency)}</div>
                <div><strong>Date:</strong> ${result.Date}</div>
            </div>
            <div class="button-container">
                <button class="button updateButton">Update</button>
                <button class="button deleteButton">Delete</button>
                <button class="button watchedButton">Watched</button>
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

        li.querySelector('.watchedButton').addEventListener('click', () => {
            selectedRowId = result.id;
            showWatchedModal(result);
        })

        ol.appendChild(li)
    })
}

// use the info from the search or just list all 
async function listRows(orderField = 'Date') { 
    try{
        const response = await axios ({
            method: "GET",
            url: `http://localhost:3000/api/rows?orderField=${orderField}&tableId=${TABLEID}`
        });
        allResults = response.data;
        console.log("Recieved Rows:, ", allResults);

        displayResults(allResults);        
    } catch(error) {
        console.log("Error fetching rows: ", error);
    }
}

// print stars for urgency
function getExclamation(urgency) {
    let exclamation = '' 
    for (let i = 0; i < urgency; i++) {
        exclamation += '❗';
    }
    return exclamation
}

function showUpdateModal(result) {
    document.getElementById('updateGenre').value = result.Genre;
    document.getElementById('updateTitle').value = result.Title;
    document.getElementById('updateMovieOrTV').value = result["Movie or TV"];
    document.getElementById('updateUrgency').value = result.Urgency;
    document.getElementById('updateModal').style.display = 'block';
}

function submitUpdate() {
    const updateData = {
        "Genre": document.getElementById('updateGenre').value,
        "Title": document.getElementById('updateTitle').value,
        "Movie or TV": document.getElementById('updateMovieOrTV').value,
        "Urgency": document.getElementById('updateUrgency').value,
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
        listRows();
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

function showWatchedModal(result) {
    selectedRowId = result.id;
    document.getElementById('watchedModal').style.display = 'block'
}

function confirmWatched() {
    let watchedTableId = '310961';
    // first send to watched database
    const selectedRow = allResults.find(result => result.id === selectedRowId);

    console.log('selected row', selectedRow)

    if(!selectedRow){
        console.error('Selected row not found');
        return;
    }
    
    // Prepare data
    const watchedData = {
        "Genre": selectedRow.Genre,
        "Title": selectedRow.Title,
        "Movie or TV": selectedRow["Movie or TV"],
        "Rating": document.getElementById('updateRating').value,
        "Date": new Date().toISOString().split('T')[0], // yyyy-mm-dd 
    };

    console.log('form data:', watchedData);

    axios({
        method: 'POST',
        url: `http://localhost:3000/api/submit/?tableId=${watchedTableId}`,
        headers: {
            "Content-Type": "application/json"
        },
        data: watchedData
    }).then(response => {
        document.getElementById('watchedModal').style.display = 'none';
        confirmDelete();
    }).catch((error) => {
        console.error('Error submitting form:', error.response ? error.response.data : error.message);
    });
}

// Event listener for the order button
document.getElementById('orderButton').addEventListener('click', () => {
    const orderField = document.getElementById('orderSelect').value;
    listRows(orderField);
});

// Event listener for search bar 
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

document.getElementById('watchedClose').addEventListener('click', () => {
    document.getElementById('watchedModal').style.display = 'none';
});

document.getElementById('confirmWatched').addEventListener('click', confirmWatched);
document.getElementById('cancelWatched').addEventListener('click', () => {
    document.getElementById('watchedModal').style.display = 'none';
});


// initial call
document.addEventListener("DOMContentLoaded", (event) => {
    listRows();
});
