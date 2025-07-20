// Helper: Get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch workflows from JSON file
async function fetchWorkflows() {
    try {
        const response = await fetch('data/workflows.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching workflows:', error);
        return null;
    }
}

// Show loading state
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
}

// Hide loading state
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

// Show error message
function showError(message = 'Unable to load content. Please try again later.') {
    const error = document.getElementById('error');
    if (error) {
        error.textContent = message;
        error.style.display = 'block';
    }
}

// Hide error message
function hideError() {
    const error = document.getElementById('error');
    if (error) error.style.display = 'none';
}

// Create workflow card HTML
function createWorkflowCard(workflow) {
    const iconsHtml = workflow.icons.map(icon => 
        `<span class="workflow-icon">${icon}</span>`
    ).join('');
    
    const tagsHtml = workflow.tags.map(tag => 
        `<span class="workflow-tag">${tag}</span>`
    ).join('');

    return `
        <div class="workflow-card" data-category="${workflow.category}" data-id="${workflow.id}">
            <div class="workflow-card-header">
                <div class="workflow-icons">
                    ${iconsHtml}
                </div>
                <span class="workflow-count">${workflow.count}</span>
            </div>
            <h3>${workflow.title}</h3>
            <p>${workflow.shortDescription}</p>
            <div class="workflow-tags">
                ${tagsHtml}
            </div>
            <div class="workflow-actions">
                <a href="workflow.html?id=${workflow.id}" class="view-button">
                    View →
                </a>
            </div>
        </div>
    `;
}

// Render Homepage Workflow Cards
async function renderWorkflowCards() {
    showLoading();
    hideError();
    
    const workflows = await fetchWorkflows();
    const container = document.getElementById('workflows');
    
    if (!workflows || !container) {
        hideLoading();
        showError();
        return;
    }

    try {
        container.innerHTML = workflows.map(workflow => createWorkflowCard(workflow)).join('');
        
        // Add click event listeners to cards
        const cards = container.querySelectorAll('.workflow-card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on the View link directly
                if (e.target.classList.contains('view-button')) return;
                
                const workflowId = card.dataset.id;
                window.location.href = `workflow.html?id=${workflowId}`;
            });
        });
        
        hideLoading();
    } catch (error) {
        console.error('Error rendering workflow cards:', error);
        hideLoading();
        showError();
    }
}

// Render Workflow Detail (for workflow.html)
async function renderWorkflowDetail() {
    showLoading();
    hideError();
    
    const workflowId = getQueryParam('id');
    const workflows = await fetchWorkflows();
    const container = document.getElementById('workflow-detail');
    
    if (!workflows || !container) {
        hideLoading();
        showError();
        return;
    }

    const workflow = workflows.find(wf => wf.id === workflowId);
    
    if (!workflow) {
        hideLoading();
        showError('Workflow not found.');
        return;
    }

    try {
        const iconsHtml = workflow.icons.map(icon => 
            `<span class="workflow-icon">${icon}</span>`
        ).join('');
        
        const tagsHtml = workflow.tags.map(tag => 
            `<span class="workflow-tag">${tag}</span>`
        ).join('');

        container.innerHTML = `
            <div class="workflow-card-header">
                <div class="workflow-icons">
                    ${iconsHtml}
                </div>
                <span class="workflow-count">${workflow.count}</span>
            </div>
            <h2>${workflow.title}</h2>
            <p class="description">${workflow.shortDescription}</p>
            <div class="workflow-tags">
                ${tagsHtml}
            </div>
            <div class="full-description">
                <p>${workflow.fullDescription}</p>
            </div>
            <button class="use-template-btn">Use Template Free</button>
        `;
        
        hideLoading();
    } catch (error) {
        console.error('Error rendering workflow detail:', error);
        hideLoading();
        showError();
    }
}

// Filter workflows by category
function filterWorkflows(category) {
    const cards = document.querySelectorAll('.workflow-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Search workflows
function searchWorkflows(query) {
    const cards = document.querySelectorAll('.workflow-card');
    const searchTerm = query.toLowerCase();
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.workflow-tag')).map(tag => tag.textContent.toLowerCase());
        
        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       tags.some(tag => tag.includes(searchTerm));
        
        if (matches) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Setup filter functionality
function setupFilters() {
    const filterTags = document.querySelectorAll('.tag[data-filter]');
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            tag.classList.add('active');
            
            // Filter workflows
            const category = tag.dataset.filter;
            filterWorkflows(category);
        });
    });
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            searchWorkflows(query);
        });
    }
}

// Map filter categories to workflow categories
function getCategoryMapping() {
    return {
        'all': 'all',
        'reporting': 'all', // Show all for reporting since most have reporting
        'optimization': 'seo',
        'seo': 'seo',
        'analytics': 'analytics',
        'ai': 'analytics', // AI agent is in analytics
        'ads': 'ads',
        'meta': 'ads',
        'bigquery': 'analytics',
        'tiktok': 'ads'
    };
}

// Enhanced filter function with proper mapping
function setupEnhancedFilters() {
    const filterTags = document.querySelectorAll('.tag[data-filter]');
    const categoryMapping = getCategoryMapping();
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tag
            tag.classList.add('active');
            
            // Get filter type and map to category
            const filterType = tag.dataset.filter;
            const category = categoryMapping[filterType] || filterType;
            
            // Special handling for specific filters
            if (filterType === 'reporting') {
                // Show all workflows that have "Reporting" in their tags
                const cards = document.querySelectorAll('.workflow-card');
                cards.forEach(card => {
                    const tags = Array.from(card.querySelectorAll('.workflow-tag')).map(tag => tag.textContent);
                    if (tags.includes('Reporting')) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            } else {
                filterWorkflows(category);
            }
        });
    });
}

// Initialize page based on which HTML is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the homepage
    if (document.getElementById('workflows')) {
        renderWorkflowCards().then(() => {
            setupEnhancedFilters();
            setupSearch();
        });
    }
    
    // Check if we're on the workflow detail page
    if (document.getElementById('workflow-detail')) {
        renderWorkflowDetail();
    }
    
    // Setup back button (exists on workflow.html)
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});
