let button = document.getElementById("my-button"); //task 2
button.addEventListener("click", function() {
    console.log("hello world");
});

const moi = document.getElementById("hello"); //task 3
button.addEventListener("click", function() {
    moi.innerHTML = "Moi maailma";
});

const button2 = document.getElementById("add-data"); //task 4
const list = document.getElementById("list");

button2.addEventListener("click", function() {
    const li = document.createElement("li");
    li.textContent = "you just clicked the button";
    list.appendChild(li);
    
});

const input = document.getElementById("text-area"); //task 5
button2.addEventListener("click", function() {
    const li = document.createElement("li");
    li.textContent = input.value;
    list.appendChild(li);
    input.value = ""; // Clear the input field afterwards
});