document.addEventListener('DOMContentLoaded', async () => {
    const eventsList = document.getElementById('events-list');
    const categoryFilter = document.getElementById('category-filter');
    
    const categoryMapping = {
        "donate": "Донат",
        "ecology": "Екологія",
        "military": "Військове",
        "help": "Допомога",
        "education": "Освіта",
        "medicine": "Медицина",
        "community": "Громадська діяльність",
        "social": "Соціальні ініціативи",
        "emergency": "Надзвичайні ситуації",
        "mental-health": "Психологічна підтримка",
        "human-rights": "Права людини",
        "reconstruction": "Відновлення інфраструктури"
    };
    
    async function loadEvents(category = "all") {
        try {
            let url = "https://newhandy-4b950124bf06.herokuapp.com/api/events/";
            if (category !== "all") {
                url += `?category=${category}`;
            }
            
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (!response.ok) {
                throw new Error("Не вдалося завантажити події");
            }
            
            let events = await response.json();
            eventsList.innerHTML = "";
            
            if (events.length === 0) {
                eventsList.innerHTML = `<p>Наразі немає доступних подій.</p>`;
                return;
            }
            
            events.forEach(async (event) => {
                const isRegistered = await checkRegistration(event.id);
                eventsList.appendChild(createEventCard(event, isRegistered));
            });
        } catch (error) {
            console.error(error);
            eventsList.innerHTML = `<p>Сталася помилка при завантаженні подій.</p>`;
        }
    }
    
    function createEventCard(event, isRegistered) {
        const eventCard = document.createElement('div');
        eventCard.classList.add('event-card');
        
        const subscribeButton = document.createElement('button');
        subscribeButton.classList.add(isRegistered ? 'unsubscribe-button' : 'subscribe-button');
        subscribeButton.textContent = isRegistered ? 'Відписатися' : 'Підписатися';
        
        subscribeButton.addEventListener('click', async () => {
            if (subscribeButton.textContent === 'Підписатися') {
                await subscribe(event.id);
                subscribeButton.textContent = 'Відписатися';
                subscribeButton.classList.replace('subscribe-button', 'unsubscribe-button');
            } else {
                await unsubscribe(event.id);
                subscribeButton.textContent = 'Підписатися';
                subscribeButton.classList.replace('unsubscribe-button', 'subscribe-button');
            }
        });
        
        eventCard.innerHTML = `
            <img class="event-image" src="https://newhandy-4b950124bf06.herokuapp.com${event.image}" alt="${event.title}">
            <div class="event-content">
                <h3 class="event-name">${event.title}</h3>
                <div class="event-description-container">
                    <p class="event-description">${event.description}</p>
                </div>
                <div class="event-details-container">
                    <div class="event-details">
                        <p class="event-location">${event.location_full}</p>
                        <p class="event-dates">${event.start_time} - ${event.end_time}</p>
                    </div>
                    <div class="event-details">
                        <p class="event-category">${categoryMapping[event.category] || event.category}</p>

                        <div class="event-author">
                          <a href="https://rest-jade.vercel.app/profileView.html?userId=${event.posted_by}" class="user-profile-link">
                                    <img class="author-pic" src="https://newhandy-4b950124bf06.herokuapp.com${event.posted_by_profile_picture || 'https://via.placeholder.com/50'}" alt="Profile Picture">
                                    
                        </div>            
                    </div>
                </div>
            </div>
        `;
        
        const eventDetails = eventCard.querySelector('.event-details-container');
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('subscribe-button-container');
        buttonContainer.appendChild(subscribeButton);
        eventDetails.appendChild(buttonContainer);
        
        return eventCard;
    }
    
    async function checkRegistration(eventId) {
        const token = localStorage.getItem("access_token");
        if (!token) return false;

        try {
            const response = await fetch(`https://newhandy-4b950124bf06.herokuapp.com/events/${eventId}/check-registration/`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Не вдалося отримати статус реєстрації.");
            }
            
            const data = await response.json();
            return data.registered;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    
    async function subscribe(eventId) {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Будь ласка, увійдіть у систему.");
            return;
        }

        try {
            await fetch(`https://newhandy-4b950124bf06.herokuapp.com/events/${eventId}/`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.error("Помилка підписки:", error);
        }
    }
    
    async function unsubscribe(eventId) {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert("Будь ласка, увійдіть у систему.");
            return;
        }

        try {
            await fetch(`https://newhandy-4b950124bf06.herokuapp.com/unsubscribe/${eventId}/`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            console.error("Помилка відписки:", error);
        }
    }
    
    await loadEvents();
    categoryFilter.addEventListener("change", async () => {
        await loadEvents(categoryFilter.value);
    });
});
