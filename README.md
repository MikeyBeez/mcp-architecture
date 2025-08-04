# 🏗️ MCP Architecture Server

**Intelligent architectural document management, discovery, and consistency maintenance for Claude**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

## 🌟 Overview

The MCP Architecture Server provides Claude with intelligent capabilities for managing architectural documentation. It transforms scattered documentation into a smart, searchable, and cross-referenced knowledge system.

### 🎯 Key Features

- **🔍 Smart Document Discovery**: Find architectural documents by topic, keyword, or purpose
- **📋 Structured Overview**: Organized view of all architectural documentation
- **🔗 Cross-Reference Analysis**: Understand relationships between documents  
- **📄 Template System**: Create consistent architectural documents
- **🎨 Document Templates**: Protocol and system documentation templates
- **💡 Gentle Integration**: Works seamlessly with existing Obsidian workflows

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- Claude Desktop or MCP-compatible client
- Obsidian vault with architectural documentation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-architecture.git
cd mcp-architecture

# Install dependencies
npm install

# Start the server
npm start
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-architecture": {
      "command": "node",
      "args": ["/path/to/mcp-architecture/src/index.js"]
    }
  }
}
```

## 🛠️ Available Tools

### 📋 Core Tools

| Tool | Description | Example |
|------|-------------|---------|
| `arch_find_document` | Smart document discovery | Find docs about "protocols" |
| `arch_list_architecture` | Structured overview | List all architectural docs |
| `arch_cross_reference` | Show document relationships | See what references this doc |
| `arch_get_document` | Read full document content | Get the complete Master Index |

### 🎨 Creation Tools

| Tool | Description | Example |
|------|-------------|---------|
| `arch_create_from_template` | Create from template | New protocol document |
| `arch_get_template` | View available templates | See protocol template |

## 💡 Usage Examples

### Find Documents
```javascript
// Find all documents about protocols
arch_find_document("protocols")

// Search for project-related docs
arch_find_document("project catalogue")

// Look for architecture overviews
arch_find_document("architecture index")
```

### Explore Relationships
```javascript
// See what documents reference the Master Index
arch_cross_reference("master-architecture-index")

// Understand protocol relationships
arch_cross_reference("protocols-index")
```

### Create New Documents
```javascript
// Create a new protocol
arch_create_from_template({
  type: "protocol",
  title: "New Development Protocol",
  description: "Protocol for managing development workflows",
  location: "protocols/Development Protocol.md"
})

// Create a system document
arch_create_from_template({
  type: "system", 
  title: "Authentication System",
  description: "System for managing user authentication",
  location: "Architecture/Authentication System.md"
})
```

## 🏗️ Architecture

### Document Registry
The server maintains a registry of architectural documents with:
- **Smart Keywords**: Enables intelligent search and discovery
- **Type Classification**: Organizes documents by purpose (index, catalogue, guide, etc.)
- **Relationship Mapping**: Tracks connections between documents
- **Path Resolution**: Direct links to Obsidian files

### Template System
Pre-built templates for:
- **Protocol Documents**: Operational procedures and workflows
- **System Documents**: Architectural system documentation
- **Extensible**: Easy to add new template types

### Integration Points
- **Obsidian Integration**: Reads/writes directly to Obsidian vault
- **Brain System**: Can integrate with existing Brain memory systems
- **MCP Ecosystem**: Works alongside other MCP tools

## 📊 Document Types

| Type | Description | Examples |
|------|-------------|----------|
| `index` | Master indices and overviews | Master Architecture Index |
| `catalogue` | Project and resource catalogues | Master Project Catalogue |
| `guide` | How-to guides and procedures | Gentle Reminder Guide |
| `protocols` | Operational protocols | Protocol indices |
| `system` | System architecture docs | Component documentation |

## 🔧 Configuration

### Document Registry
Located in `src/index.js`, the `ARCHITECTURAL_DOCS` object defines:
- Document paths in Obsidian vault
- Keywords for search optimization
- Document types for organization
- Descriptions for context

### Obsidian Path
Update `OBSIDIAN_VAULT_PATH` to match your vault location:
```javascript
const OBSIDIAN_VAULT_PATH = '/Users/yourusername/Obsidian/your-vault';
```

## 🧪 Development

### Project Structure
```
mcp-architecture/
├── src/
│   └── index.js           # Main server implementation
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

### Adding New Documents
1. Add entry to `ARCHITECTURAL_DOCS` registry
2. Define appropriate keywords for searchability
3. Set correct document type for organization
4. Test discovery with `arch_find_document`

### Creating Templates
1. Add template to `TEMPLATES` object
2. Use `{variable}` syntax for substitution
3. Test with `arch_create_from_template`

## 🤝 Integration with Other Tools

### Brain System Integration
```javascript
// Use with Brain for enhanced context
brain_recall("architecture")  // Load architectural context
arch_find_document("protocols")  // Find specific documents
brain_remember("key_finding", result)  // Store discoveries
```

### Project Discovery
```javascript
// Combine with project finder
project_finder:find_project("mcp-architecture")
arch_find_document("mcp tools")  // Find related architecture docs
```

## 📈 Performance

- **Fast Document Discovery**: Indexed search across all architectural documents
- **Minimal Memory Usage**: Efficient document registry and search algorithms
- **Quick Template Generation**: Pre-compiled templates for instant document creation
- **Obsidian Integration**: Direct file system operations for minimal overhead

## 🔍 Troubleshooting

### Common Issues

**Documents Not Found**
- Verify `OBSIDIAN_VAULT_PATH` is correct
- Check document paths in `ARCHITECTURAL_DOCS`
- Ensure Obsidian files exist at specified locations

**Search Not Working**
- Update keywords in document registry
- Use broader search terms
- Check document type filters

**Template Creation Fails**
- Verify write permissions to Obsidian vault
- Check directory structure exists
- Validate template syntax

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Future Enhancements

- **Impact Analysis**: Track what needs updating when documents change
- **Consistency Validation**: Automated checks for document consistency
- **Advanced Cross-References**: Deep semantic relationship analysis
- **Template Extensions**: Additional document types and templates
- **Graph Visualization**: Visual mapping of document relationships

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ❤️ for the Claude ecosystem**