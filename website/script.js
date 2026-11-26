
const consent = document.getElementById("consent");
const startButton = document.getElementById("startButton");

if (consent && startButton) {

    consent.addEventListener("change", function () {
        startButton.disabled = !consent.checked;
    });

    startButton.addEventListener("click", function () {

        // Generarea unui ID anonim
        const participantID = crypto.randomUUID();

        // Repartizarea aleatorie în două grupuri
        const group = Math.random() < 0.5
            ? "normal"
            : "dark_patterns";

        // Salvarea informațiilor despre participant
        sessionStorage.setItem("participantID", participantID);
        sessionStorage.setItem("group", group);

        // Salvarea momentului de începere
        sessionStorage.setItem("startTime", Date.now());

        // Redirecționarea către magazin
        if (group === "normal") {
            window.location.href = "normal.html";
        } else {
            window.location.href = "dark_patterns.html";
        }
    });
}
