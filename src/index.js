#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const fs = require('fs').promises;
const path = require('path');

const server = new Server(
  {
    name: 'mcp-architecture',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configuration
const OBSIDIAN_VAULT_PATH = '/Users/bard/Obsidian/bard';
const ARCHITECTURE_FOLDER = path.join(OBSIDIAN_VAULT_PATH, 'Architecture');

// Architecture document registry
const ARCHITECTURAL_DOCS = {
  'master-architecture-index': {
    path: 'Architecture/Master Architecture Index.md',
    title: 'Master Architecture Index',
    type: 'index',
    keywords: ['architecture', 'systems', 'overview', 'index', 'master'],
    description: 'Central registry of all architectural systems and their documentation'
  },
  'project-catalogue': {
    path: 'Architecture/📁 Project Catalogue - Master Index.md',
    title: 'Master Project Catalogue',
    type: 'catalogue',
    keywords: ['projects', 'catalogue', 'discovery', 'navigation', 'index'],
    description: 'Comprehensive directory of all projects with searchable details'
  },
  'gentle-reminders': {
    path: 'Architecture/🔔 Gentle Reminder Integration Guide.md',
    title: 'Gentle Reminder Integration Guide',
    type: 'guide',
    keywords: ['reminders', 'behavioral', 'gentle', 'guidance', 'integration'],
    description: 'Behavioral guidance system for reinforcing good knowledge management practices'
  },
  'protocols-index': {
    path: 'protocols/Master Protocol Index.md',
    title: 'Master Protocol Index',
    type: 'protocols',
    keywords: ['protocols', 'operational', 'procedures', 'workflows'],
    description: 'Registry of all operational and system protocols'
  }
};

// Document templates
const TEMPLATES = {
  protocol: `# {title}

*{description}*

---

## 🎯 Purpose

Define the purpose and scope of this protocol.

## ⚡ Trigger Conditions

- When to activate this protocol
- Specific situations or contexts
- Decision criteria

## 📋 Protocol Steps

### Step 1: Initial Assessment
- Action items
- Decision points
- Success criteria

### Step 2: Execution
- Implementation steps
- Key activities
- Monitoring points

### Step 3: Validation
- Verification steps
- Quality checks
- Completion criteria

## 🔄 Integration Points

- How this protocol connects to other protocols
- Dependencies and prerequisites
- Handoff procedures

## 📊 Success Metrics

- How to measure protocol effectiveness
- Key performance indicators
- Improvement opportunities

## 🚨 Error Recovery

- What to do when things go wrong
- Fallback procedures
- Escalation paths

---

*Created: {date}*
*Status: Draft*
*Version: 1.0*
`,
  system: `# {title}

*{description}*

---

## 🌟 Overview

Brief overview of this architectural system.

## 🏗️ Architecture

### Core Components
- Component 1: Description
- Component 2: Description
- Component 3: Description

### System Diagram
\`\`\`
[Add system diagram or flowchart here]
\`\`\`

## 🎯 Key Features

- Feature 1: Description and benefit
- Feature 2: Description and benefit
- Feature 3: Description and benefit

## 🔧 Implementation

### Files & Location
- Primary files and their locations
- Configuration files
- Documentation locations

### Dependencies
- System dependencies
- Integration requirements
- Prerequisites

## 📊 Performance & Metrics

- Performance characteristics
- Success metrics
- Monitoring approaches

## 🔄 Integration Points

- How this system integrates with others
- API interfaces
- Data flows

## 🚀 Usage Examples

\`\`\`
[Add usage examples here]
\`\`\`

## 🔧 Maintenance

- Regular maintenance tasks
- Update procedures
- Troubleshooting guide

---

*Status: {status}*
*Location: {location}*
*Created: {date}*
*Last Updated: {date}*
`
};

// Utility functions
async function readObsidianFile(relativePath) {
  try {
    const fullPath = path.join(OBSIDIAN_VAULT_PATH, relativePath);
    const content = await fs.readFile(fullPath, 'utf8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read ${relativePath}: ${error.message}`);
  }
}

async function writeObsidianFile(relativePath, content) {
  try {
    const fullPath = path.join(OBSIDIAN_VAULT_PATH, relativePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
    return fullPath;
  } catch (error) {
    throw new Error(`Failed to write ${relativePath}: ${error.message}`);
  }
}

function searchDocuments(query) {
  const results = [];
  const searchTerms = query.toLowerCase().split(' ');
  
  for (const [id, doc] of Object.entries(ARCHITECTURAL_DOCS)) {
    const searchableText = [
      doc.title,
      doc.description,
      ...doc.keywords,
      doc.type
    ].join(' ').toLowerCase();
    
    const matchScore = searchTerms.reduce((score, term) => {
      if (searchableText.includes(term)) {
        // Boost score for exact keyword matches
        if (doc.keywords.some(keyword => keyword.includes(term))) {
          return score + 2;
        }
        return score + 1;
      }
      return score;
    }, 0);
    
    if (matchScore > 0) {
      results.push({
        id,
        ...doc,
        relevanceScore: matchScore
      });
    }
  }
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

function getCrossReferences(docId) {
  const doc = ARCHITECTURAL_DOCS[docId];
  if (!doc) return [];
  
  const references = [];
  
  // Find documents that might reference this one
  for (const [id, otherDoc] of Object.entries(ARCHITECTURAL_DOCS)) {
    if (id === docId) continue;
    
    // Check for keyword overlaps
    const commonKeywords = doc.keywords.filter(keyword => 
      otherDoc.keywords.includes(keyword) ||
      otherDoc.title.toLowerCase().includes(keyword) ||
      otherDoc.description.toLowerCase().includes(keyword)
    );
    
    if (commonKeywords.length > 0) {
      references.push({
        id,
        title: otherDoc.title,
        type: otherDoc.type,
        relationship: `Shares keywords: ${commonKeywords.join(', ')}`,
        relevance: commonKeywords.length
      });
    }
  }
  
  return references.sort((a, b) => b.relevance - a.relevance);
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'arch_find_document',
        description: '💡 Smart architectural document discovery by topic, keyword, or purpose',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (topic, keyword, or purpose)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'arch_list_architecture',
        description: 'List all architectural documents with structured overview',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Filter by document type (index, catalogue, guide, protocols, system)',
              enum: ['index', 'catalogue', 'guide', 'protocols', 'system', 'all']
            },
          },
        },
      },
      {
        name: 'arch_cross_reference',
        description: 'Show relationships and references between architectural documents',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID to analyze cross-references for',
            },
          },
          required: ['docId'],
        },
      },
      {
        name: 'arch_get_document',
        description: 'Read the full content of a specific architectural document',
        inputSchema: {
          type: 'object',
          properties: {
            docId: {
              type: 'string',
              description: 'Document ID to retrieve',
            },
          },
          required: ['docId'],
        },
      },
      {
        name: 'arch_create_from_template',
        description: 'Create new architectural document from template',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Document template type',
              enum: ['protocol', 'system']
            },
            title: {
              type: 'string',
              description: 'Document title',
            },
            description: {
              type: 'string',
              description: 'Brief description of the document purpose',
            },
            location: {
              type: 'string',
              description: 'Relative path where to create the document (e.g., "protocols/New Protocol.md")',
            },
          },
          required: ['type', 'title', 'description', 'location'],
        },
      },
      {
        name: 'arch_get_template',
        description: 'Get a document template for creating new architectural documents',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              description: 'Template type to retrieve',
              enum: ['protocol', 'system']
            },
          },
          required: ['type'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case 'arch_find_document': {
        const { query } = request.params.arguments;
        const results = searchDocuments(query);
        
        if (results.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No architectural documents found for query: "${query}"\n\nAvailable document types: index, catalogue, guide, protocols, system\n\nTry broader terms like "protocol", "system", "project", or "architecture"`
            }]
          };
        }
        
        const formattedResults = results.map(doc => 
          `📄 **${doc.title}** (${doc.type})\n` +
          `   📍 ${doc.path}\n` +
          `   🔍 ${doc.description}\n` +
          `   🏷️ Keywords: ${doc.keywords.join(', ')}\n` +
          `   ⭐ Relevance: ${doc.relevanceScore}`
        ).join('\n\n');
        
        return {
          content: [{
            type: 'text',
            text: `Found ${results.length} architectural document(s) for "${query}":\n\n${formattedResults}\n\n💡 Use arch_get_document with the document ID to read full content`
          }]
        };
      }
      
      case 'arch_list_architecture': {
        const { type = 'all' } = request.params.arguments || {};
        
        let docs = Object.entries(ARCHITECTURAL_DOCS);
        if (type !== 'all') {
          docs = docs.filter(([_, doc]) => doc.type === type);
        }
        
        const categorized = docs.reduce((acc, [id, doc]) => {
          if (!acc[doc.type]) acc[doc.type] = [];
          acc[doc.type].push({ id, ...doc });
          return acc;
        }, {});
        
        let output = '# 🏗️ Architectural Documents Overview\n\n';
        
        for (const [category, categoryDocs] of Object.entries(categorized)) {
          const emoji = {
            'index': '📚',
            'catalogue': '📁', 
            'guide': '🔔',
            'protocols': '📋',
            'system': '⚙️'
          }[category] || '📄';
          
          output += `## ${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} Documents\n\n`;
          
          categoryDocs.forEach(doc => {
            output += `### ${doc.title}\n`;
            output += `📍 **Location**: \`${doc.path}\`\n`;
            output += `🎯 **Purpose**: ${doc.description}\n`;
            output += `🏷️ **Keywords**: ${doc.keywords.join(', ')}\n`;
            output += `🆔 **ID**: \`${doc.id}\`\n\n`;
          });
        }
        
        output += `\n💡 **Usage Tips**:\n`;
        output += `- Use \`arch_find_document("keyword")\` to search documents\n`;
        output += `- Use \`arch_get_document("doc-id")\` to read full content\n`;
        output += `- Use \`arch_cross_reference("doc-id")\` to see relationships\n`;
        
        return {
          content: [{
            type: 'text',
            text: output
          }]
        };
      }
      
      case 'arch_cross_reference': {
        const { docId } = request.params.arguments;
        
        if (!ARCHITECTURAL_DOCS[docId]) {
          return {
            content: [{
              type: 'text',
              text: `Document ID "${docId}" not found. Use arch_list_architecture to see available documents.`
            }]
          };
        }
        
        const doc = ARCHITECTURAL_DOCS[docId];
        const references = getCrossReferences(docId);
        
        let output = `# 🔗 Cross-References for "${doc.title}"\n\n`;
        output += `**Document Type**: ${doc.type}\n`;
        output += `**Keywords**: ${doc.keywords.join(', ')}\n\n`;
        
        if (references.length === 0) {
          output += `No direct cross-references found.\n\n`;
        } else {
          output += `## Related Documents (${references.length})\n\n`;
          references.forEach(ref => {
            output += `### ${ref.title} (${ref.type})\n`;
            output += `🔗 **Relationship**: ${ref.relationship}\n`;
            output += `⭐ **Relevance**: ${ref.relevance}\n`;
            output += `🆔 **ID**: \`${ref.id}\`\n\n`;
          });
        }
        
        output += `💡 **Integration Suggestions**:\n`;
        output += `- Consider referencing related documents in this document\n`;
        output += `- Check if concepts from related documents apply here\n`;
        output += `- Update related documents when this document changes\n`;
        
        return {
          content: [{
            type: 'text',
            text: output
          }]
        };
      }
      
      case 'arch_get_document': {
        const { docId } = request.params.arguments;
        
        if (!ARCHITECTURAL_DOCS[docId]) {
          return {
            content: [{
              type: 'text',
              text: `Document ID "${docId}" not found. Use arch_list_architecture to see available documents.`
            }]
          };
        }
        
        const doc = ARCHITECTURAL_DOCS[docId];
        try {
          const content = await readObsidianFile(doc.path);
          return {
            content: [{
              type: 'text',
              text: `# 📄 ${doc.title}\n\n**Location**: ${doc.path}\n**Type**: ${doc.type}\n**Description**: ${doc.description}\n\n---\n\n${content}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error reading document "${doc.title}": ${error.message}`
            }]
          };
        }
      }
      
      case 'arch_create_from_template': {
        const { type, title, description, location } = request.params.arguments;
        
        if (!TEMPLATES[type]) {
          return {
            content: [{
              type: 'text',
              text: `Template type "${type}" not found. Available templates: ${Object.keys(TEMPLATES).join(', ')}`
            }]
          };
        }
        
        const template = TEMPLATES[type];
        const date = new Date().toISOString().split('T')[0];
        const status = 'Active';
        
        const content = template
          .replace(/{title}/g, title)
          .replace(/{description}/g, description)
          .replace(/{date}/g, date)
          .replace(/{status}/g, status)
          .replace(/{location}/g, location);
        
        try {
          const fullPath = await writeObsidianFile(location, content);
          return {
            content: [{
              type: 'text',
              text: `✅ Created new ${type} document: "${title}"\n\n📍 **Location**: ${location}\n🎯 **Description**: ${description}\n📅 **Created**: ${date}\n\n💡 **Next Steps**:\n- Review and customize the template content\n- Add specific implementation details\n- Update the architectural document registry if needed\n- Consider adding cross-references to related documents\n\n**Full Path**: ${fullPath}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Error creating document: ${error.message}`
            }]
          };
        }
      }
      
      case 'arch_get_template': {
        const { type } = request.params.arguments;
        
        if (!TEMPLATES[type]) {
          return {
            content: [{
              type: 'text',
              text: `Template type "${type}" not found. Available templates: ${Object.keys(TEMPLATES).join(', ')}`
            }]
          };
        }
        
        return {
          content: [{
            type: 'text',
            text: `# 📋 ${type.charAt(0).toUpperCase() + type.slice(1)} Template\n\n\`\`\`markdown\n${TEMPLATES[type]}\n\`\`\`\n\n💡 **Template Variables**:\n- \`{title}\` - Document title\n- \`{description}\` - Document description\n- \`{date}\` - Current date\n- \`{status}\` - Document status\n- \`{location}\` - Document location\n\n**Usage**: Use \`arch_create_from_template\` to create a new document from this template.`
          }]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);
console.error('🏗️ mcp-architecture server running on stdio');
console.error('💡 Architectural document management and discovery tools ready');
