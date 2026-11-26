
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


// ==========================================
// LOGICA EXPERIMENTULUI
// ==========================================

if (document.getElementById("task1")) {

    const participantID = sessionStorage.getItem("participantID");
    const group = sessionStorage.getItem("group");

    // Verificarea sesiunii participantului
    const expectedGroup =
    window.location.pathname.endsWith("dark_patterns.html")
        ? "dark_patterns"
        : "normal";

    if (!participantID || group !== expectedGroup) {
        window.location.replace("index.html");
    } else {

        const results = {
            participant_id: participantID,
            group: group,
            task1_time: 0,
            task1_error: 0,
            task1_clicks: 0,
            task2_time: 0,
            task2_error: 0,
            task2_clicks: 0,
            task3_time: 0,
            task3_error: 0,
            task3_clicks: 0,
            total_time: 0,
            total_errors: 0,
            total_clicks: 0,
            confidence: 0,
            control: 0
        };

        let currentTask = 1;
        let taskStartTime = performance.now();
        let taskClicks = 0;

        // Numararea clickurilor
        document.addEventListener("click", function (event) {
            if (
                currentTask >= 1 &&
                currentTask <= 3 &&
                event.target.closest("button, input, select")
            ) {
                taskClicks++;
            }
        }, true);

        // Salvarea rezultatelor unei sarcini
        function saveTask(taskNumber, error) {

            const elapsedTime =
                (performance.now() - taskStartTime) / 1000;

            results[`task${taskNumber}_time`] =
                Number(elapsedTime.toFixed(2));

            results[`task${taskNumber}_error`] = error;

            results[`task${taskNumber}_clicks`] = taskClicks;
        }

        // Trecerea la urmatoarea sarcina
        function nextTask(currentID, nextID) {

            document.getElementById(currentID).hidden = true;
            document.getElementById(nextID).hidden = false;

            currentTask++;
            taskClicks = 0;
            taskStartTime = performance.now();

            window.scrollTo(0, 0);
        }

        // ==========================================
        // SARCINA 1 - CUMPARAREA PRODUSULUI
        // ==========================================

        const insurance = document.getElementById("insurance");
        const totalPrice = document.getElementById("totalPrice");

        insurance.addEventListener("change", function () {

            if (insurance.checked) {
                totalPrice.textContent = "180 lei";
            } else {
                totalPrice.textContent = "150 lei";
            }

        });

        document.getElementById("buyButton")
            .addEventListener("click", function () {

                const error = insurance.checked ? 1 : 0;

                saveTask(1, error);
                nextTask("task1", "task2");

            });

        // ==========================================
        // SARCINA 2 - IDENTIFICAREA PRETULUI
        // ==========================================

        document.getElementById("priceButton")
            .addEventListener("click", function () {

                const input = document.getElementById("priceAnswer");

                if (input.value.trim() === "" ||
                    !input.checkValidity()) {
                    alert("Introdu un pret valid.");
                    return;
                }

                const answer = Number(input.value);

                const error = answer === 230 ? 0 : 1;

                saveTask(2, error);
                nextTask("task2", "task3");

            });

        // ==========================================
        // SARCINA 3 - ANULAREA ABONAMENTULUI
        // ==========================================

        document.getElementById("cancelButton")
            .addEventListener("click", function () {

                saveTask(3, 0);
                nextTask("task3", "survey");

            });

        document.getElementById("keepButton")
            .addEventListener("click", function () {

                saveTask(3, 1);
                nextTask("task3", "survey");

            });

        // ==========================================
        // CHESTIONARUL FINAL
        // ==========================================

        document.getElementById("finishButton")
            .addEventListener("click", function () {

                results.confidence = Number(
                    document.getElementById("confidence").value
                );

                results.control = Number(
                    document.getElementById("control").value
                );

                results.total_time = Number((
                    results.task1_time +
                    results.task2_time +
                    results.task3_time
                ).toFixed(2));

                results.total_errors =
                    results.task1_error +
                    results.task2_error +
                    results.task3_error;

                results.total_clicks =
                    results.task1_clicks +
                    results.task2_clicks +
                    results.task3_clicks;

                sessionStorage.setItem(
                    "experimentResults",
                    JSON.stringify(results)
                );

                document.getElementById("survey").hidden = true;
                document.getElementById("completed").hidden = false;

                document.getElementById("resultMessage").textContent =
                    "Rezultatele au fost inregistrate cu succes.";

                console.table(results);

            });

        // ==========================================
        // EXPORTAREA REZULTATELOR IN CSV
        // ==========================================

        document.getElementById("downloadButton")
            .addEventListener("click", function () {

                const headers = Object.keys(results).join(",");
                const values = Object.values(results).join(",");

                const csv = headers + "\n" + values + "\n";

                const blob = new Blob(
                    [csv],
                    { type: "text/csv;charset=utf-8;" }
                );

                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");

                link.href = url;
                link.download =
                    `participant_${participantID}.csv`;

                document.body.appendChild(link);
                link.click();
                link.remove();

                setTimeout(() => URL.revokeObjectURL(url), 1000);

            });
    }
}
