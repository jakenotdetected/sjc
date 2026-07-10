// Small inline icon set for <option data-icon="..."> — opt-in per option,
// so selects that don't use data-icon render exactly as before.
const CUSTOM_SELECT_ICONS = {
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    person: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>'
};

function customSelectIconSvg(key) {
    const paths = CUSTOM_SELECT_ICONS[key];
    if (!paths) return '';
    return `<svg class="custom-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function initCustomSelects() {
    // Skip Google Translate's own internal <select> — it drives the actual
    // translation and must be left completely alone, or switching languages breaks.
    document.querySelectorAll('select:not(.custom-initialized):not(.goog-te-combo)').forEach(select => {
        select.classList.add('custom-initialized');

        // Build wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        if (select.parentNode) {
            select.parentNode.insertBefore(wrapper, select);
            wrapper.appendChild(select);
        }

        // Build trigger
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';

        const selectedOpt = select.options[select.selectedIndex];
        const triggerIcon = document.createElement('span');
        triggerIcon.className = 'custom-select-trigger-icon';
        triggerIcon.innerHTML = customSelectIconSvg(selectedOpt?.dataset.icon);
        triggerIcon.style.display = selectedOpt?.dataset.icon ? '' : 'none';

        const triggerText = document.createElement('span');
        triggerText.textContent = selectedOpt?.text || '';

        // Chevron
        const chevronWrap = document.createElement('div');
        chevronWrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        const chevron = chevronWrap.firstChild;

        trigger.appendChild(triggerIcon);
        trigger.appendChild(triggerText);
        trigger.appendChild(chevron);
        wrapper.appendChild(trigger);

        // Build options list
        const optionsList = document.createElement('div');
        optionsList.className = 'custom-select-options';
        optionsList.setAttribute('data-lenis-prevent', '');

        // Stop scroll propagation to prevent Lenis from stealing it
        optionsList.addEventListener('wheel', (e) => e.stopPropagation());
        optionsList.addEventListener('touchmove', (e) => e.stopPropagation());

        Array.from(select.options).forEach((option, index) => {
            const customOption = document.createElement('div');
            customOption.className = 'custom-option';
            if (option.dataset.icon) customOption.classList.add('has-icon');
            if (index === select.selectedIndex) customOption.classList.add('selected');
            customOption.innerHTML = customSelectIconSvg(option.dataset.icon) + `<span>${option.text}</span>`;
            customOption.dataset.value = option.value;

            customOption.addEventListener('click', (e) => {
                e.stopPropagation();

                // Only trigger change if value actually changed
                if (select.value !== option.value) {
                    select.value = option.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Update UI
                triggerIcon.innerHTML = customSelectIconSvg(option.dataset.icon);
                triggerIcon.style.display = option.dataset.icon ? '' : 'none';
                triggerText.textContent = option.text;
                optionsList.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                customOption.classList.add('selected');

                // Close wrapper
                wrapper.classList.remove('open');
            });
            optionsList.appendChild(customOption);
        });

        wrapper.appendChild(optionsList);

        // Open/Close toggle
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('open');
            // Close all others first
            document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
            if (!isOpen) wrapper.classList.add('open');
        });

        // Listen for external changes to the select (e.g. scripts updating it)
        select.addEventListener('change', () => {
            const opt = select.options[select.selectedIndex];
            triggerText.textContent = opt?.text || '';
            triggerIcon.innerHTML = customSelectIconSvg(opt?.dataset.icon);
            triggerIcon.style.display = opt?.dataset.icon ? '' : 'none';
            optionsList.querySelectorAll('.custom-option').forEach((opt, idx) => {
                if (idx === select.selectedIndex) opt.classList.add('selected');
                else opt.classList.remove('selected');
            });
        });
    });
}

// Close when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
});

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomSelects);
} else {
    initCustomSelects();
}

// Auto-initialize new selects using MutationObserver
const observer = new MutationObserver((mutations) => {
    let shouldInit = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.tagName === 'SELECT' || node.querySelector('select')) {
                        shouldInit = true;
                    }
                }
            });
        }
    }
    if (shouldInit) {
        initCustomSelects();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Export
window.initCustomSelects = initCustomSelects;
