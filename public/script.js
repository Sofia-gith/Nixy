document.addEventListener("DOMContentLoaded", () => {
    const days = document.querySelectorAll(".day");

    days.forEach(day => {
        day.addEventListener("click", () => {
            days.forEach(d => d.classList.remove("selected"));
            day.classList.add("selected");
        });
    });

    document.getElementById("prevMonth").addEventListener("click", () => {
        alert("Mudar para o mês anterior"); 
    });

    document.getElementById("nextMonth").addEventListener("click", () => {
        alert("Mudar para o próximo mês"); 
    });
});