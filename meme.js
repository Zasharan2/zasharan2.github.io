var randomMemeImage = document.getElementById("randomMeme");

var images = ["among-us-sus.gif", "baldi-dance.gif", "caipirinha.gif", "chiikawa-eat.jpg", "coca-cola.gif", "crying.gif", "crying-dog.jpg", "despair.gif", "jumping-cat.gif", "obamium.gif", "rick-roll.gif", "shock.jpg", "shrek-smirk.gif", "students.gif", "squidward.jpg", "triangle-dance.gif", "walter-white.gif", "yippee.gif", "zooweemama.jpg"];

randomMemeImage.src = "images/home/" + images[Math.floor(Math.random() * images.length)];
