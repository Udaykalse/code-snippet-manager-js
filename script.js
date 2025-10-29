// Code Snippet Manager Application
class SnippetManager {
    constructor() {
        this.snippets = this.loadSnippets();
        this.editingId = null;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.initializeEventListeners();
        this.applyTheme(this.currentTheme);
        this.renderSnippets();
    }

    // Load snippets from localStorage
    loadSnippets() {
        const snippetsJson = localStorage.getItem('codeSnippets');
        return snippetsJson ? JSON.parse(snippetsJson) : [];
    }

    // Save snippets to localStorage
    saveSnippets() {
        localStorage.setItem('codeSnippets', JSON.stringify(this.snippets));
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Form submission
        document.getElementById('snippet-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSnippet();
        });

        // Cancel button
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', () => {
            this.renderSnippets();
        });

        // Language filter
        document.getElementById('language-filter').addEventListener('change', () => {
            this.renderSnippets();
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Export button
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportSnippets();
        });

        // Import button
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        // Import file input
        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importSnippets(e);
        });

        // Modal close button
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('preview-modal').style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('preview-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Save or update a snippet
    saveSnippet() {
        const title = document.getElementById('snippet-title').value.trim();
        const language = document.getElementById('snippet-language').value;
        const tags = document.getElementById('snippet-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
        const code = document.getElementById('snippet-code').value;
        const description = document.getElementById('snippet-description').value.trim();

        if (!title || !language || !code) {
            alert('Please fill in all required fields');
            return;
        }

        const snippet = {
            id: this.editingId || Date.now().toString(),
            title,
            language,
            tags,
            code,
            description,
            createdAt: this.editingId ? 
                this.snippets.find(s => s.id === this.editingId).createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (this.editingId) {
            // Update existing snippet
            const index = this.snippets.findIndex(s => s.id === this.editingId);
            this.snippets[index] = snippet;
        } else {
            // Add new snippet
            this.snippets.push(snippet);
        }

        this.saveSnippets();
        this.renderSnippets();
        this.resetForm();
    }

    // Edit a snippet
    editSnippet(id) {
        const snippet = this.snippets.find(s => s.id === id);
        if (!snippet) return;

        document.getElementById('snippet-title').value = snippet.title;
        document.getElementById('snippet-language').value = snippet.language;
        document.getElementById('snippet-tags').value = snippet.tags.join(', ');
        document.getElementById('snippet-code').value = snippet.code;
        document.getElementById('snippet-description').value = snippet.description;

        this.editingId = id;
        document.getElementById('save-btn').textContent = 'Update Snippet';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        // Scroll to form
        document.querySelector('.snippet-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Delete a snippet
    deleteSnippet(id) {
        if (confirm('Are you sure you want to delete this snippet?')) {
            this.snippets = this.snippets.filter(s => s.id !== id);
            this.saveSnippets();
            this.renderSnippets();
        }
    }

    // Copy code to clipboard
    copyToClipboard(code) {
        navigator.clipboard.writeText(code).then(() => {
            // Show feedback (you could add a toast notification here)
            alert('Code copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy code to clipboard');
        });
    }

    // Preview code in iframe (for HTML snippets)
    previewCode(code, language) {
        if (language !== 'html') {
            alert('Preview is only available for HTML snippets');
            return;
        }

        const iframe = document.getElementById('preview-frame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        iframeDoc.open();
        iframeDoc.write(code);
        iframeDoc.close();
        
        document.getElementById('preview-modal').style.display = 'block';
    }

    // Cancel editing
    cancelEdit() {
        this.editingId = null;
        this.resetForm();
    }

    // Reset the form
    resetForm() {
        document.getElementById('snippet-form').reset();
        document.getElementById('save-btn').textContent = 'Save Snippet';
        document.getElementById('cancel-btn').style.display = 'none';
        this.editingId = null;
    }

    // Apply syntax highlighting
    applySyntaxHighlighting(code, language) {
        // Simple syntax highlighting implementation
        // In a real app, you might want to use a library for better highlighting
        
        let highlighted = code;
        
        // Escape HTML entities
        highlighted = highlighted
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        // Apply language-specific highlighting
        if (language === 'html') {
            highlighted = highlighted
                .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '$1<span class="code-tag">$2</span>')
                .replace(/([a-zA-Z-]+)=/g, '<span class="code-attribute">$1</span>=')
                .replace(/("([^"]*)")/g, '<span class="code-string">$1</span>')
                .replace(/&lt;!--([\s\S]*?)--&gt;/g, '<span class="code-comment">&lt;!--$1--&gt;</span>');
        } else if (language === 'css') {
            highlighted = highlighted
                .replace(/([a-zA-Z-]+)\s*:/g, '<span class="code-property">$1</span>:')
                .replace(/(:)([^;]+);/g, '$1<span class="code-value">$2</span>;')
                .replace(/\/\*([\s\S]*?)\*\//g, '<span class="code-comment">/*$1*/</span>');
        } else if (language === 'javascript') {
            highlighted = highlighted
                .replace(/\b(function|var|let|const|if|else|for|while|return|class)\b/g, '<span class="code-keyword">$1</span>')
                .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="code-function">$1</span>(')
                .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*[;=,\n])/g, '<span class="code-variable">$1</span>')
                .replace(/("([^"]*)"|'([^']*)')/g, '<span class="code-string">$1</span>')
                .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
                .replace(/\/\/([^\n]*)/g, '<span class="code-comment">//$1</span>')
                .replace(/\/\*([\s\S]*?)\*\//g, '<span class="code-comment">/*$1*/</span>');
        }
        
        return highlighted;
    }

    // Render all snippets
    renderSnippets() {
        const container = document.getElementById('snippets-container');
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const languageFilter = document.getElementById('language-filter').value;

        // Filter snippets
        const filteredSnippets = this.snippets.filter(snippet => {
            const matchesSearch = !searchTerm || 
                snippet.title.toLowerCase().includes(searchTerm) ||
                snippet.description.toLowerCase().includes(searchTerm) ||
                snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                snippet.code.toLowerCase().includes(searchTerm);
            
            const matchesLanguage = !languageFilter || snippet.language === languageFilter;
            
            return matchesSearch && matchesLanguage;
        });

        if (filteredSnippets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No snippets found. ${this.snippets.length === 0 ? 'Add your first code snippet!' : 'Try adjusting your search or filter.'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredSnippets.map(snippet => {
            const highlightedCode = this.applySyntaxHighlighting(snippet.code, snippet.language);
            
            return `
                <div class="snippet-card">
                    <div class="snippet-header">
                        <div>
                            <div class="snippet-title">${snippet.title}</div>
                            <span class="snippet-language">${snippet.language.toUpperCase()}</span>
                        </div>
                    </div>
                    ${snippet.tags.length > 0 ? `
                        <div class="snippet-tags">
                            ${snippet.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${snippet.description ? `<div class="snippet-description">${snippet.description}</div>` : ''}
                    <div class="snippet-code syntax-${snippet.language}">${highlightedCode}</div>
                    <div class="snippet-actions">
                        <button class="btn btn-primary" onclick="snippetManager.copyToClipboard('${snippet.code.replace(/'/g, "\\'")}')">Copy</button>
                        <button class="btn btn-warning" onclick="snippetManager.editSnippet('${snippet.id}')">Edit</button>
                        <button class="btn btn-danger" onclick="snippetManager.deleteSnippet('${snippet.id}')">Delete</button>
                        ${snippet.language === 'html' ? `<button class="btn btn-success" onclick="snippetManager.previewCode('${snippet.code.replace(/'/g, "\\'")}', '${snippet.language}')">Preview</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Toggle between light and dark themes
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    // Apply theme to the document
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('theme-toggle').textContent = 
            theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    // Export snippets as JSON file
    exportSnippets() {
        const dataStr = JSON.stringify(this.snippets, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'code-snippets.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Import snippets from JSON file
    importSnippets(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedSnippets = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedSnippets)) {
                    throw new Error('Invalid file format');
                }

                // Validate snippet structure
                const validSnippets = importedSnippets.filter(snippet => 
                    snippet.title && snippet.language && snippet.code
                );

                if (validSnippets.length === 0) {
                    throw new Error('No valid snippets found in file');
                }

                if (confirm(`Import ${validSnippets.length} snippet(s)? This will add them to your existing snippets.`)) {
                    // Generate new IDs to avoid conflicts
                    validSnippets.forEach(snippet => {
                        snippet.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                        snippet.createdAt = new Date().toISOString();
                        snippet.updatedAt = new Date().toISOString();
                    });

                    this.snippets.push(...validSnippets);
                    this.saveSnippets();
                    this.renderSnippets();
                    alert('Snippets imported successfully!');
                }
            } catch (error) {
                alert('Error importing snippets: ' + error.message);
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
}

// Initialize the application when the DOM is loaded
let snippetManager;
document.addEventListener('DOMContentLoaded', () => {
    snippetManager = new SnippetManager();
});