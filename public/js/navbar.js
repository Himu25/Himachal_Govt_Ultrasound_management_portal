let navbar = document.querySelector(".navbar");
let navLinks = document.querySelector(".nav-links");
let menuOpenBtn = document.querySelector(".navbar .bx-menu");
let menuCloseBtn = document.querySelector(".nav-links .bx-x");
menuOpenBtn.onclick = function() {
navLinks.style.left = "0";
}
menuCloseBtn.onclick = function() {
navLinks.style.left = "-100%";
}
let firstArrow = document.querySelector(".first-arrow");
firstArrow.onclick = function() {
navLinks.classList.toggle("show1");
}
let secondArrow = document.querySelector(".second-arrow");
secondArrow.onclick = function() {
navLinks.classList.toggle("show2");
}
let thirdArrow = document.querySelector(".third-arrow");
thirdArrow.onclick = function() {
navLinks.classList.toggle("show3");
}
let fourthArrow = document.querySelector(".fourth-arrow");
fourthArrow.onclick = function() {
navLinks.classList.toggle("show4");
}
let fifthArrow = document.querySelector(".fifth-arrow");
fifthArrow.onclick = function() {
navLinks.classList.toggle("show5");
}
let arrow = document.querySelectorAll(".arrow");
for (var i = 0; i < arrow.length; i++) {
arrow[i].addEventListener("click", (e)=>{
let arrowParent = e.target.parentElement.parentElement;
arrowParent.classList.toggle("showMenu");
});
}
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".bx-menu");
console.log(sidebarBtn);
sidebarBtn.addEventListener("click", ()=>{
sidebar.classList.toggle("close");
});