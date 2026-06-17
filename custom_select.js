function initCustomSelects() {
    document.querySelectorAll('select:not(.custom-initialized)').forEach(select => {
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
        
        const triggerText = document.createElement('span');
        triggerText.textContent = select.options[select.selectedIndex]?.text || '';
        
        // Chevron
        const chevronWrap = document.createElement('div');
        chevronWrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        const chevron = chevronWrap.firstChild;
        
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
            if (index === select.selectedIndex) customOption.classList.add('selected');
            customOption.textContent = option.text;
            customOption.dataset.value = option.value;
            
            customOption.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Only trigger change if value actually changed
                if (select.value !== option.value) {
                    select.value = option.value;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }
                
                // Update UI
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
            triggerText.textContent = select.options[select.selectedIndex]?.text || '';
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
