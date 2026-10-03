// Default resources shown when no saved data exists.
const defaultResources = [
    {
        id: 1,
        title: "MDN Web Docs",
        category: "Web Dev",
        description: "Documentation and guides for HTML, CSS and JavaScript.",
        link: "https://developer.mozilla.org/",
        upvotes: 24
    },
    {
        id: 2,
        title: "JavaScript.info",
        category: "Web Dev",
        description: "A detailed guide for learning modern JavaScript.",
        link: "https://javascript.info/",
        upvotes: 18
    },
    {
        id: 3,
        title: "Flutter",
        category: "App Dev",
        description: "A toolkit for building cross-platform applications.",
        link: "https://flutter.dev/",
        upvotes: 15
    },
    {
        id: 4,
        title: "Firebase",
        category: "Tools",
        description: "Tools and services for building web and mobile applications.",
        link: "https://firebase.google.com/",
        upvotes: 21
    },
    {
        id: 5,
        title: "Google AI Studio",
        category: "AI/ML",
        description: "Explore Google's tools for building applications with AI.",
        link: "https://aistudio.google.com/",
        upvotes: 17
    },
    {
        id: 6,
        title: "GitHub",
        category: "Tools",
        description: "Platform for hosting, managing and collaborating on code.",
        link: "https://github.com/",
        upvotes: 32
    }
];

const storageKey = "developerResources";
const allowedCategories = ["Web Dev", "App Dev", "AI/ML", "Tools"];

const resourceGrid = document.getElementById("resource-grid");
const emptyState = document.getElementById("empty-state");
const resultCount = document.getElementById("result-count");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const resourceForm = document.getElementById("resource-form");
const formMessage = document.getElementById("form-message");

let resources = loadResources();

// Load saved resources, or use a fresh copy of the defaults.
function loadResources() {
    const savedResources = localStorage.getItem(storageKey);

    if (savedResources) {
        try {
            const parsedResources = JSON.parse(savedResources);
            if (Array.isArray(parsedResources)) {
                return parsedResources;
            }
        } catch (error) {
            // Invalid saved data is replaced with the default list.
        }
    }

    return defaultResources.map(function (resource) {
        return { ...resource };
    });
}

// Save the current resource list in the browser.
function saveResources() {
    localStorage.setItem(storageKey, JSON.stringify(resources));
}

function getBadgeClass(category) {
    return "badge-" + category.toLowerCase().replace("/", "-").replaceAll(" ", "-");
}

// Create resource cards with DOM methods so user text is never treated as HTML.
function renderResources(resourceList) {
    resourceGrid.replaceChildren();

    const count = resourceList.length;
    resultCount.textContent = count + (count === 1 ? " resource found" : " resources found");
    emptyState.hidden = count !== 0;

    resourceList.forEach(function (resource) {
        const card = document.createElement("article");
        card.className = "resource-card";

        const cardTop = document.createElement("div");
        cardTop.className = "card-top";

        const title = document.createElement("h3");
        title.className = "card-title";
        title.textContent = resource.title;

        const badge = document.createElement("span");
        badge.className = "category-badge " + getBadgeClass(resource.category);
        badge.textContent = resource.category;

        const description = document.createElement("p");
        description.className = "card-description";
        description.textContent = resource.description;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const visitLink = document.createElement("a");
        visitLink.className = "visit-link";
        visitLink.href = resource.link;
        visitLink.target = "_blank";
        visitLink.rel = "noopener noreferrer";
        visitLink.textContent = "Visit Resource ↗";
        visitLink.setAttribute("aria-label", "Visit " + resource.title + " in a new tab");

        const upvoteButton = document.createElement("button");
        upvoteButton.className = "upvote-button";
        upvoteButton.type = "button";
        upvoteButton.textContent = "♡ " + resource.upvotes;
        upvoteButton.setAttribute("aria-label", "Upvote " + resource.title + ". Current count: " + resource.upvotes);
        upvoteButton.addEventListener("click", function () {
            handleUpvote(resource.id);
        });

        cardTop.append(title, badge);
        actions.append(visitLink, upvoteButton);
        card.append(cardTop, description, actions);
        resourceGrid.appendChild(card);
    });
}

// Apply search text and category at the same time.
function filterResources() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredResources = resources.filter(function (resource) {
        const searchableText = (resource.title + " " + resource.description + " " + resource.category).toLowerCase();
        const matchesSearch = searchableText.includes(searchTerm);
        const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderResources(filteredResources);
}

function handleSearch() {
    filterResources();
}

// Confirm that a link uses the safe http or https protocol.
function isValidLink(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
}

// Validate the form and add a new resource.
function addResource(event) {
    event.preventDefault();

    const title = document.getElementById("resource-title").value.trim();
    const category = document.getElementById("resource-category").value;
    const description = document.getElementById("resource-description").value.trim();
    const link = document.getElementById("resource-link").value.trim();

    if (!title || !category || !description || !link) {
        showFormMessage("Please fill in every field.", "error");
        return;
    }

    if (title.length > 80 || description.length > 240 || link.length > 500) {
        showFormMessage("One or more fields are too long.", "error");
        return;
    }

    if (!allowedCategories.includes(category)) {
        showFormMessage("Please choose a valid category.", "error");
        return;
    }

    if (!isValidLink(link)) {
        showFormMessage("Please enter a valid http or https link.", "error");
        return;
    }

    const newResource = {
        id: Date.now(),
        title: title,
        category: category,
        description: description,
        link: link,
        upvotes: 0
    };

    resources.push(newResource);
    saveResources();
    resourceForm.reset();
    searchInput.value = "";
    categoryFilter.value = "All";
    filterResources();
    showFormMessage("Resource added successfully!", "success");
}

// Increase an upvote and save the updated count.
function handleUpvote(resourceId) {
    const resource = resources.find(function (item) {
        return item.id === resourceId;
    });

    if (!resource) {
        return;
    }

    resource.upvotes += 1;
    saveResources();
    filterResources();
}

searchInput.addEventListener("input", handleSearch);
categoryFilter.addEventListener("change", filterResources);
resourceForm.addEventListener("submit", addResource);

renderResources(resources);
