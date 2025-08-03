const inputField=document.getElementById("input-show")
const submitButton=document.getElementById("submit-data")
const showContainer=document.getElementsByClassName("show-container")[0]

submitButton.addEventListener("click", async function(){
    event.preventDefault();
    const baseUrl="https://api.tvmaze.com/search/shows?q=";
    const searchValue=inputField.value;
    const url=baseUrl+searchValue;
    const response=await fetch(url)
    const data=await response.json()
    createShowData(data)

})

function createShowData(data) {
    // delete previous data
    showContainer.innerHTML = '';

    data.forEach(show => {
        const showData = document.createElement('div');
        showData.classList.add('show-data');

        const showImage = document.createElement('img');
        // because some tv shows dont display pictures
        // so we need to check if the image exists
        if (show.show.image && show.show.image.medium) {
            showImage.src = show.show.image.medium;
        } else {
            showImage.src = 'kirby.jpg'; // default image if none exists
        }
        showData.appendChild(showImage);
        const showInfo = document.createElement('div');
        showInfo.classList.add('show-info');
        const showTitle = document.createElement('h1');
        showTitle.textContent = show.show.name;
        showInfo.appendChild(showTitle);
        const showSummary = document.createElement('p');
        showSummary.innerHTML = show.show.summary;
        showInfo.appendChild(showSummary);
        showData.appendChild(showInfo);
        showContainer.appendChild(showData);
    });
}