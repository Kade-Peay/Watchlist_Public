const TABLEID = '300853'

// TODO: where to watch

document.getElementById('submit').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get values from form fields
    const genre = document.getElementById('genre').value;
    const title = document.getElementById('title').value;
    const selectedMedia = document.querySelector('input[name="media"]:checked');
    const media = selectedMedia ? selectedMedia.value : '';
    const urgent = document.getElementById('urgent').value;
    const date = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

    // Prepare data 
    const formData = {
        "Genre": genre,
        "Title": title,
        "Movie or TV": media,
        "Urgency": parseInt(urgent),
        "Date": date
    };

    // Send data to backend server
    axios({
        method: "POST",
        url: `http://localhost:3000/api/submit?tableId=${TABLEID}`,
        headers: {
            "Content-Type": "application/json"
        },
        data: formData
    }).then(() => {
        alert('Form submitted successfully');
        window.location.href="index.html"
    }).catch((error) => {
        console.error('Error submitting form:', error);
    });
});