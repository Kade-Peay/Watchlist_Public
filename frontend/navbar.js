const template = document.getElementById("topnav");

template.innerHTML = `
    <div class="topnav">
        <a id="home" href="index.html">Home Page</a>
        <a id='submit_page' href="submit_page.html">Add New Entry</a>
        <a id='watched_list' href="watchedList.html">Watched</a>
    </div>
`;

var target = document.getElementById("topnav");
document.body.insertBefore(template.content, target);

if (document.title == "Home Page") {
    document.getElementById("home").classList.add("active");
}
if (document.title == "Submit Page") {
    document.getElementById("submit_page").classList.add("active");
}
if (document.title == "Watched List") {
    document.getElementById("watched_list").classList.add("active");
}