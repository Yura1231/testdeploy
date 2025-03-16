document.addEventListener("DOMContentLoaded", async function () {
    loadUserEvents();
    loadSubscribedEvents();

    document.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", function () {
            document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
            this.classList.add("active");

            document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));

            const tabId = this.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });
});

async function loadUserEvents() {
    try {
        let response = await fetch("https://newhandy-4b950124bf06.herokuapp.com/my-events/", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access_token"),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Помилка завантаження подій");
        }

        let events = await response.json();
        let container = document.getElementById("published");

        if (events.length === 0) {
            container.innerHTML = `<div class="content-box">Ви ще не публікували подій.</div>`;
            return;
        }

        let html = events
            .map(
                (event) => `
           <div class="event-item" id="event-${event.id}">
                <div class="event-header">
                    <h3 class="event-title">${event.title}</h3>
                    <span class="event-date">${event.start_date} - ${event.end_date}</span>
                </div>
                <p><strong>Місце:</strong> ${event.location_full}</p>
                <p><strong>Категорія:</strong> ${event.category}</p>
                <p class="event-description">${event.description}</p>
                <p class="event-description">${event.people_needed}</p>
                <button class="event-btn delete-btn" data-id="${event.id}">Видалити</button>
           </div>
        `
            )
            .join("");

        container.innerHTML = html;

        // Додаємо обробник подій для кнопок "Видалити"
        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", async function () {
                let eventId = this.getAttribute("data-id");
                await deleteEvent(eventId);
            });
        });

    } catch (error) {
        console.error("Помилка:", error);
        document.getElementById("published").innerHTML = `<div class="content-box">Не вдалося завантажити події.</div>`;
    }
}

// Функція для видалення події
async function deleteEvent(eventId) {
    if (!confirm("Ви впевнені, що хочете видалити цю подію?")) {
        return;
    }

    try {
        let response = await fetch(`https://newhandy-4b950124bf06.herokuapp.com/delete/${eventId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access_token"),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Не вдалося видалити подію");
        }

        
        document.getElementById(`event-${eventId}`).remove();
        alert("Подію успішно видалено!");
    } catch (error) {
        console.error("Помилка:", error);
        alert("Не вдалося видалити подію.");
    }
}


async function loadSubscribedEvents() {
    try {
        let response = await fetch("https://newhandy-4b950124bf06.herokuapp.com/my-subscriptions/", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access_token"),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Помилка завантаження підписок");
        }

        let events = await response.json();
        let container = document.getElementById("helped");

        if (events.length === 0) {
            container.innerHTML = `<div class="content-box">Ви ще не підписалися на жодну подію.</div>`;
            return;
        }

        let html = events
            .map(
                (event) => `
           <div class="event-item">
    <div class="event-header">
    
    
        <h3 class="event-title">${event.title}</h3>
        
        <span class="event-date">${event.start_date} - ${event.end_date}</span>
    </div>
    <img src="https://newhandy-4b950124bf06.herokuapp.com${event.image}" alt="${event.title}" >
    <p><strong>Місце:</strong> ${event.location_full}</p>
    <p><strong>Категорія:</strong> ${event.category}</p>
    <p class="event-description">${event.description}</p>
    
    <button class="event-btn">Деталі</button>
</div>
        `
            )
            .join("");

        container.innerHTML = html;
    } catch (error) {
        console.error("Помилка:", error);
        document.getElementById("helped").innerHTML = `<div class="content-box">Не вдалося завантажити події.</div>`;
    }
}

document.getElementById("editNameBtn").addEventListener("click", function() {
    let nameDisplay = document.getElementById("userName");
    let nameInput = document.getElementById("nameInput");
    let photoInput = document.getElementById("photoInput");
    let profilePhoto = document.getElementById("profilePhoto");
    if (nameInput.style.display === "none") {
        // Початок редагування
        nameInput.value = nameDisplay.textContent;
        nameDisplay.style.display = "none";
        nameInput.style.display = "block";
        nameInput.focus();
        // Показуємо вибір фото
        photoInput.style.display = "block";
        this.textContent = "Зберегти";
        // Додаємо кнопку "Скасувати", якщо її ще немає
        if (!document.getElementById("cancelNameBtn")) {
            let cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Скасувати";
            cancelBtn.classList.add("edit-btn", "cancel-btn");
            cancelBtn.id = "cancelNameBtn";
            cancelBtn.style.marginLeft = "10px";
            this.parentNode.appendChild(cancelBtn);
            // Функціонал кнопки "Скасувати"
            cancelBtn.addEventListener("click", function() {
                nameInput.style.display = "none";
                nameDisplay.style.display = "block";
                // Ховаємо поле вибору фото
                photoInput.style.display = "none";
                document.getElementById("editNameBtn").textContent = "Редагувати";
                cancelBtn.remove();
            });
        }
        // Додаємо обробник для вибору фото
        photoInput.addEventListener("change", function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePhoto.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

    } else {
        // Збереження змін
        nameDisplay.textContent = nameInput.value;
        nameInput.style.display = "none";
        nameDisplay.style.display = "block";
        // Ховаємо поле вибору фото
        photoInput.style.display = "none";
        this.textContent = "Редагувати";
        // Видаляємо кнопку "Скасувати"
        let cancelBtn = document.getElementById("cancelNameBtn");
        if (cancelBtn) cancelBtn.remove();
    }
});

document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        let inputField = this.previousElementSibling;
        if (inputField.tagName === 'INPUT') {
            if (inputField.disabled) {
                // Початок редагування
                inputField.dataset.originalValue = inputField.value;
                inputField.disabled = false;
                inputField.focus();
                this.textContent = 'Зберегти';

                if (!this.nextElementSibling || !this.nextElementSibling.classList.contains('cancel-btn')) {
                    let cancelBtn = document.createElement('button');
                    cancelBtn.textContent = 'Скасувати';
                    cancelBtn.classList.add('edit-btn', 'cancel-btn');
                    cancelBtn.style.marginLeft = '10px';
                    this.parentNode.appendChild(cancelBtn);

                    cancelBtn.addEventListener('click', function() {
                        inputField.value = inputField.dataset.originalValue;
                        inputField.disabled = true;
                        btn.textContent = 'Редагувати';
                        cancelBtn.remove();
                    });
                }
            } else {
                // Збереження змін
                inputField.disabled = true;
                this.textContent = 'Редагувати';

                if (this.nextElementSibling && this.nextElementSibling.classList.contains('cancel-btn')) {
                    this.nextElementSibling.remove();
                }

                // Відправлення даних на сервер
                let updatedData = {
                    first_name: document.getElementById('first_name').value,
                    last_name: document.getElementById('last_name').value,
                    email: document.getElementById('email').value,
                    phone_number: document.getElementById('number_phone').value,
                    description: document.getElementById('content').value
                };

                const token = localStorage.getItem('access_token'); // Додаємо токен аутентифікації

                try {
                    let response = await fetch('https://newhandy-4b950124bf06.herokuapp.com/update-profile/', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(updatedData)
                    });

                    let result = await response.json();
                    if (response.ok) {
                        alert('Профіль оновлено успішно!');
                    } else {
                        alert('Помилка оновлення: ' + result.error);
                    }
                } catch (error) {
                    console.error('Помилка:', error);
                }
            }
        }
    });
});


document.getElementById("photoInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            document.getElementById("profilePhoto").src = e.target.result;

            const token = localStorage.getItem('access_token');

            try {
                let response = await fetch('https://newhandy-4b950124bf06.herokuapp.com/update-profile/', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ profile_picture: e.target.result })
                });

                let result = await response.json();
                if (response.ok) {
                    alert('Фото оновлено!');
                } else {
                    alert('Помилка оновлення фото: ' + result.error);
                }
            } catch (error) {
                console.error('Помилка:', error);
            }
        };
        reader.readAsDataURL(file);
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("access_token"); 
    if (!accessToken) {
        alert("Будь ласка, увійдіть у свій акаунт.");
        window.location.href = "login.html"; 
        return;
    }

    fetch("https://newhandy-4b950124bf06.herokuapp.com/profile/", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Помилка отримання профілю");
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("userName").textContent = `${data.first_name} ${data.last_name}`;
        document.getElementById("email").value = data.email;
        document.getElementById("number_phone").value = data.phone_number;
        document.getElementById("first_name").value = data.first_name;
        document.getElementById("last_name").value = data.last_name;

        if (data.profile_picture) {
            document.getElementById("profilePhoto").src = `https://newhandy-4b950124bf06.herokuapp.com${data.profile_picture}`;
        }

        if (data.description) {
            document.getElementById("content").value = data.description;
        }
    })
    .catch(error => {
        console.error("Помилка:", error);
    });
});



document.getElementById('help-btn').addEventListener('click', function() {
    window.location.href = 'add-event.html';
});




async function loadUserComments() {
    try {
        let response = await fetch("https://newhandy-4b950124bf06.herokuapp.com/comments/", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access_token"),
                "Content-Type": "application/json",
            },
        });
    
        if (!response.ok) {
            throw new Error("Помилка завантаження коментарів");
        }
    
        let comments = await response.json();
        console.log(comments); // Перевіряємо, що приходить від сервера
    
        const reviewsContainer = document.getElementById("reviews");
        if (!reviewsContainer) {
            console.error("Помилка: контейнер 'reviews' не знайдено!");
            return;
        }
    
        reviewsContainer.innerHTML = ""; // Очищаємо перед вставкою коментарів
    
        if (comments.length === 0) {
            reviewsContainer.innerHTML = `<div class="content-box">Немає коментарів.</div>`;
            return;
        }
    
        comments.forEach(comment => {
            const commentElement = document.createElement("div");
            commentElement.classList.add("content-box");
    
            commentElement.innerHTML = `
                <div class="review-item">
                    <img src="https://newhandy-4b950124bf06.herokuapp.com${comment.author_profile_picture}" alt="User Avatar" class="user-avatar">
                    <div class="review-content">
                        <span class="user-name">${comment.author_first_name} ${comment.author_last_name}</span>
                        <p class="review-text">${comment.text}</p>
                        <small>${new Date(comment.created_at).toLocaleString()}</small>
                    </div>
                </div>
            `;
    
            reviewsContainer.appendChild(commentElement);
        });
    
    } catch (error) {
        console.error("Помилка:", error);
        document.getElementById("reviews").innerHTML = `<div class="content-box">Не вдалося завантажити коментарі.</div>`;
    }
}

// Викликаємо функцію завантаження коментарів при завантаженні сторінки
document.addEventListener("DOMContentLoaded", function () {
    loadUserComments();
});

