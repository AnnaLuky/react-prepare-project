const baseUrl = "https://api.artic.edu/api/v1/";

let images;
const initCollection = () => {
    getListPage(1).catch(error => console.error(error));
};

const getRootAndClean = () => {
    const root = document.getElementById("root");
    while (root.firstChild) {
        root.removeChild(root.firstChild);
    }

    return root;
};

const getListPage = (page = 1) => {
    const root = getRootAndClean();
    return getList(page).then(result => {

        const listContainer = document.createElement("div");
        listContainer.setAttribute("class", "list-container");

        result.list.forEach(imgObject => {
            const imgContainer = document.createElement("div");

            const titleContainer = document.createElement("div");
            titleContainer.setAttribute("class", "img-title-container");

            const artist = document.createElement("div");
            artist.setAttribute("class", "img-artist");
            artist.appendChild(document.createTextNode(imgObject.artist_title));
            titleContainer.appendChild(artist);

            const title = document.createElement("div");
            title.setAttribute("class", "img-title");
            title.appendChild(document.createTextNode(imgObject.title));
            titleContainer.appendChild(title);




            imgContainer.appendChild(titleContainer);


            imgContainer.setAttribute("class", "img-container");
            const thumbnail = document.createElement("img");
            thumbnail.setAttribute("src", createImageLink(imgObject.image_id, 200));
            thumbnail.setAttribute("style", `width: 200px`);
            imgContainer.appendChild(thumbnail);


            imgContainer.addEventListener("click", () => getImagePage(imgObject.id, page));
            listContainer.appendChild(imgContainer);
        });
        root.appendChild(listContainer);

        const paginationContainer = document.createElement("div");
        paginationContainer.setAttribute("class", "pagination-container");

        paginationContainer.innerHTML = "";
        if (page > 1) {
            const prevLink = document.createElement("a");
            prevLink.setAttribute("href", "#");
            prevLink.innerHTML = "&larr; prev page";
            prevLink.addEventListener("click", () => getListPage(page - 1));
            paginationContainer.appendChild(prevLink);
            paginationContainer.appendChild(document.createTextNode(" "));
        }
        const pageIndicator = document.createElement("span");
        pageIndicator.innerHTML = `page ${page} of ${result.pagination.total_pages}`;
        paginationContainer.appendChild(pageIndicator);
        if (page <= result.pagination.total_pages - 1) {
            paginationContainer.appendChild(document.createTextNode(" "));
            const nextLink = document.createElement("a");
            nextLink.setAttribute("href", "#");
            nextLink.innerHTML = "next page &rarr;";
            nextLink.addEventListener("click", () => getListPage(page + 1));
            paginationContainer.appendChild(nextLink);
        }

        root.appendChild(paginationContainer);
    });
};


const getImagePage = (id, page) => {
    const root = getRootAndClean();
    getJson(`artworks/${id}`).then((object) => {
        const details = object.data;
        const detailContainer = document.createElement("div");
        detailContainer.setAttribute("class", "detail-container");


        const author = document.createElement("h2");
        author.innerHTML = details.artist_display.replace("\n", "<br>");
        detailContainer.appendChild(author);

        const title = document.createElement("h3");
        title.appendChild(document.createTextNode(details.title));
        detailContainer.appendChild(title);

        const medium = document.createElement("p");
        medium.setAttribute("class", "medium");
        medium.appendChild(document.createTextNode(details.medium_display));
        detailContainer.appendChild(medium);

        const imgContainer = document.createElement("div");
        imgContainer.setAttribute("class", "detail-image");
        const image = document.createElement("img");
        image.setAttribute("src", createImageLink(details.image_id, 800));
        image.setAttribute("style", `width: 800px`);
        imgContainer.appendChild(image);

        detailContainer.appendChild(imgContainer);

        const infoContainer = document.createElement("div");
        infoContainer.setAttribute("class", "detail-description");



        if (details.provenance_text) {
            const paragraph = document.createElement("p");
            paragraph.appendChild(document.createTextNode(details.provenance_text));
            infoContainer.appendChild(paragraph);
        }


        detailContainer.appendChild(infoContainer);

        const backLink = document.createElement("a");
        backLink.setAttribute("href", "#");
        backLink.appendChild(document.createTextNode("Back"));
        backLink.addEventListener("click", () => getListPage(page));
        detailContainer.appendChild(backLink);


        root.appendChild(detailContainer);
    });
};


const createImageLink = (id, size) => `https://www.artic.edu/iiif/2/${id}/full/${size},/0/default.jpg`;
const getList = (page = 1) => postJson("artworks/search", {
    limit: 20,
    page,
    query: { term: { style_id: "TM-7543" } }
})
    .then(results =>
        Promise.all(results.data.map(object => getJson(`artworks/${object.id}?fields=image_id,artist_title`).then(full_object => ({
            ...object,
            image_id: full_object.data.image_id,
            artist_title: full_object.data.artist_title
        })))
        ).then(list => ({
            pagination: results.pagination,
            list
        })));

const getObject = (objectId) => getJson(`objects/${objectId}`);

const getJson = (url) => fetchJson(url, { method: "GET" });
const postJson = (url, body) => fetchJson(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
});

const fetchJson = (url, options) => fetch(`${baseUrl}${url}`, options)
    .then(resp => {
        if (!resp.ok) {
            const message = `${resp.status}: ${resp.statusText}. ${resp.url}`;
            console.error(message);
            return Promise.reject(Error(message));
        }

        return resp.json();
    });


document.addEventListener("DOMContentLoaded", initCollection);
