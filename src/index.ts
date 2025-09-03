const extensionsGrid = document.querySelector('.extensions-grid') as HTMLDivElement;
const filters = Array.from(document.querySelectorAll('.filter'));

interface Extension {
    logo: string
    name: string
    description: string
    isActive: boolean
}

let extensions: Extension[] = [];
let activeFilter = 0;

async function loadJson(url: string) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}. ${response.statusText}`);
        }

        return response.json();

    } catch (error) {
        console.error(error);
    }
}

function updateExtensions() {
    if (!(extensionsGrid instanceof HTMLElement)) {
        return;
    }

    let cardsHtml = '';

    // Filter the extensions based on the active filter
    const filteredExtensions = extensions.filter(extension => {
        return activeFilter === 0 || (activeFilter === 1 && extension.isActive) || (activeFilter === 2 && !extension.isActive);
    });

    filteredExtensions.forEach((extension, key) => {
        cardsHtml += `
            <div class="extension" data-name="${extension.name}">
				<div class="info">
					<img src="${extension.logo}" alt="${extension.name}">
					<div>
						<p class="name">${extension.name}</p>
						<p class="description">${extension.description}</p>
					</div>
				</div>
				<div class="actions">
					<button class="remove">Remove</button>
					<div class="switch">
						<label for="toggle-${key}">
							<div class="toggle"></div>
						</label>
						<input type="checkbox"  id="toggle-${key}" ${extension.isActive ? "checked" : ""}>
					</div>
				</div>
			</div>
        `;
    });

    // Update the extensions grid
    extensionsGrid.innerHTML = cardsHtml;

    // Update the event listeners
    const activeToggles = extensionsGrid.querySelectorAll('input[type="checkbox"]');
    const removeButtons = extensionsGrid.querySelectorAll('.remove');

    activeToggles.forEach(toggle => {
        toggle.addEventListener('change', toggleActive);
    });

    removeButtons.forEach(button => {
        button.addEventListener('click', removeExtension);
    });
}

function updateFilter(newIndex: number) {
    // Remove "active" from the currently active filter, if any
    const current = filters[activeFilter];
    if (current) {
        current.classList.remove("active");
    }

    // Add "active" to the new filter
    const next = filters[newIndex];
    if (next) {
        next.classList.add("active");
    }

    // Update the active index
    activeFilter = newIndex;

    updateExtensions();
}

function toggleActive(this: HTMLInputElement, _: Event) {
    const target = this.closest('.extension');
    const name = (target instanceof HTMLElement) ? target.dataset.name : '';

    // Toggle between active and inactive
    extensions = extensions.map(extension => {
        if (extension.name === name) {
            extension.isActive = !extension.isActive;
        }

        return extension;
    });

    // Update the extensions view if the active filter is not 'all'
    if (activeFilter != 0) {
        setTimeout(() => { // Wait until the transition ends
            updateExtensions();
        }, 200)
    }
}

function removeExtension(this: HTMLButtonElement, _: Event) {
    const target = this.closest('.extension');
    const name = (target instanceof HTMLElement) ? target.dataset.name : '';

    extensions = extensions.filter(exension => exension.name !== name);

    updateExtensions();
}

async function main() {
    extensions = await loadJson('./extensions.json');

    updateExtensions();

    filters.forEach((filter, key) => {
        filter.addEventListener('click', () => updateFilter(key));
    });
}

main();