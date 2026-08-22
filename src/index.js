#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const live = require('./live.js');
const { fillTemplate } = require('./fill.js');
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
const OBSIDIAN_VAULT_PATH = '/Users/bard/Code/claude-brain/data/BrainVault';
const ARCHITECTURE_FOLDER = path.join(OBSIDIAN_VAULT_PATH, 'Architecture');

// COMPREHENSIVE Architecture document registry - Updated 2026-01-14
// This serves as the "where is everything" reference for the AI assistant
const ARCHITECTURAL_DOCS = {
  // === INDEX DOCUMENTS ===
  'master-architecture-index': {
    path: null,   // generated 2026-08-22 -- the file it named was a year old or absent
    title: 'Master Architecture Index',
    type: 'index',
    keywords: ['architecture', 'systems', 'overview', 'index', 'master', 'integration', 'ecosystem'],
    description: 'Central registry of all architectural systems with complete integration status',
    get content() { return live.masterArchitectureIndex(); }
  },
  'protocols-index': {
    path: null,   // generated 2026-08-22 -- the file it named was a year old or absent
    title: 'Master Protocol Index',
    type: 'protocols',
    keywords: ['protocols', 'operational', 'procedures', 'workflows', 'foundation'],
    description: 'Registry of all operational and system protocols with foundation protocol coverage',
    get content() { return live.protocolIndex(); }
  },

  // === SYSTEM LOCATION REFERENCES ===
  'system-paths': {
    path: null,  // generated from the running system, not stored
    title: 'System Paths Reference',
    type: 'system',
    keywords: ['paths', 'locations', 'directories', 'files', 'where', 'find'],
    description: 'Critical file system locations for all major systems',
    get content() { return live.systemPaths(); }
  },

  'mcp-tools-registry': {
    path: null,
    title: 'MCP Tools Registry',
    type: 'system',
    keywords: ['mcp', 'tools', 'servers', 'registry', 'list'],
    description: 'Complete list of all MCP tools and their purposes',
    get content() { return live.mcpToolsRegistry(); }
  },

  'protocol-system-guide': {
    path: null,
    title: 'Protocol System Guide',
    type: 'protocols',
    keywords: ['protocol', 'create', 'edit', 'add', 'new', 'modify'],
    description: 'How to work with the protocol system',
    get content() { return live.protocolSystemGuide(); }
  },

  'project-creation-guide': {
    path: null,
    title: 'Project Creation Guide',
    type: 'system',
    keywords: ['project', 'create', 'new', 'setup', 'github', 'repo'],
    description: 'How to create new projects using the system',
    get content() { return live.projectCreationGuide(); }
  },

  'architecture-server-docs': {
    path: null,   // generated 2026-08-22 -- the file it named was a year old or absent
    title: 'MCP Architecture Server Documentation',
    type: 'system',
    keywords: ['mcp', 'architecture', 'server', 'smart', 'discovery', 'templates', 'cross-reference'],
    description: 'Documentation for the intelligent architectural document management system',
    get content() { return live.architectureServerDocs(); }
  },

  'protocol-triggers': {
    path: null,
    title: 'Protocol Triggers Quick Reference',
    type: 'protocols',
    keywords: ['trigger', 'when', 'activate', 'use', 'which', 'protocol', 'select'],
    description: 'Quick reference for when to activate each protocol - like skill descriptions',
    get content() { return live.protocolTriggers(); }
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
              description: 'Filter by document type (index, protocols, system)',
              enum: ['index', 'protocols', 'system', 'all']
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
        name: 'arch_fill_template',
        description: 'Fill a document template from a brief using the local model on pop, and REFUSE the result unless every section the template demands came back filled. The template structure is the check -- nothing is written if a heading is missing, still holds its placeholder text, or is under 40 characters.',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Template type to fill', enum: ['protocol', 'system'] },
            title: { type: 'string', description: 'Document title' },
            description: { type: 'string', description: 'One-line description' },
            brief: { type: 'string', description: 'The material to write from. Required -- this tool fills a template from what you supply, it does not invent content.' },
            location: { type: 'string', description: 'Optional vault path. Supplied means write the file, but ONLY if the check passes. Omitted means return the content for review without writing.' },
          },
          required: ['type', 'title', 'description', 'brief'],
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
      {
        name: 'help',
        description: 'Get comprehensive documentation for all architecture functions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      }
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
              text: `No architectural documents found for query: "${query}"\n\nAvailable document types: index, protocols, system\n\nTry broader terms like "protocol", "system", "project", or "architecture"`
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
            'protocols': '📋',
            'system': '⚙️'
          }[category] || '📄';
          
          output += `## ${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} Documents\n\n`;
          
          categoryDocs.forEach(doc => {
            output += `### ${doc.title}\n`;
            if (doc.path) {
              output += `📍 **Location**: \`${doc.path}\`\n`;
            } else {
              output += `📍 **Location**: generated from the running system on every call\n`;
            }
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

        // Handle virtual documents (content stored in registry, not in files)
        if (doc.content) {
          return {
            content: [{
              type: 'text',
              text: `# 📄 ${doc.title}\n\n**Type**: ${doc.type}\n**Description**: ${doc.description}\n\n---\n\n${doc.content}`
            }]
          };
        }

        // Handle file-based documents
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
      
      case 'arch_fill_template': {
        const { type, title, description, brief, location } = request.params.arguments;
        if (!TEMPLATES[type]) {
          return { content: [{ type: 'text',
            text: `Template type "${type}" not found. Available: ${Object.keys(TEMPLATES).join(', ')}` }] };
        }
        const r = await fillTemplate(TEMPLATES[type], { title, description, brief, location });

        if (!r.ok) {
          // A refusal is a result, not an error. Say exactly which sections failed so
          // the caller can fix the brief rather than guess.
          const c = r.check;
          return { content: [{ type: 'text', text:
            `REFUSED — the filled document did not satisfy the template.\n\n` +
            `Reason: ${r.error}\n` +
            (c ? `Sections required: ${c.required}\n` +
                 (c.missing.length   ? `Missing: ${c.missing.join(', ')}\n` : '') +
                 (c.unchanged.length ? `Still the placeholder: ${c.unchanged.join(', ')}\n` : '') +
                 (c.thin.length      ? `Too thin: ${c.thin.join(', ')}\n` : '') : '') +
            `\nNothing was written. Add the missing material to the brief and call again.` +
            (r.content ? `\n\n--- what came back, for reference ---\n${r.content}` : '') }] };
        }

        let written = null;
        if (location) {
          try { written = await writeObsidianFile(location, r.content); }
          catch (e) {
            return { content: [{ type: 'text', text:
              `The document PASSED the template check but could not be written: ${e.message}\n\n${r.content}` }] };
          }
        }
        return { content: [{ type: 'text', text:
          `✅ ${type} document "${title}" filled and verified.\n\n` +
          `Check: ${r.check.why}\n` +
          `Attempts: ${r.attempts}` + (r.tokens ? ` · ${r.tokens} tokens` : '') + (r.tps ? ` · ${r.tps} tok/s` : '') + `\n` +
          (written ? `Written to: ${written}\n` : `Not written — no location given. Review it, then call again with a location.\n`) +
          `\n---\n${r.content}` }] };
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
      
      case 'help': {
        const helpText = `
# 🏗️ Architecture MCP Server - Intelligent Document Management

## Purpose
MCP server for intelligent architectural document management, discovery, and consistency maintenance. Provides smart document discovery, cross-referencing, and template-based document creation for architectural documentation.

## Available Tools

### arch_find_document 💡
Smart architectural document discovery by topic, keyword, or purpose:
- **query**: Search query (topic, keyword, or purpose)
- Uses intelligent matching to find relevant architectural documents
- Searches across document titles, content, and metadata
- Returns prioritized results based on relevance and document quality

### arch_list_architecture
List all architectural documents with structured overview:
- **type**: Filter by document type (index | protocols | system | all, optional)
- Provides comprehensive catalog of all architectural documentation
- Shows document hierarchy and organizational structure
- Includes metadata about document status and relationships

### arch_cross_reference
Show relationships and references between architectural documents:
- **docId**: Document ID to analyze cross-references for
- Maps connections between related architectural documents
- Identifies dependencies and reference patterns
- Helps understand document ecosystem and relationships

### arch_get_document
Read the full content of a specific architectural document:
- **docId**: Document ID to retrieve
- Returns complete document content with formatting
- Includes document metadata and relationship information
- Provides access to detailed architectural specifications

### arch_create_from_template
Create new architectural document from template:
- **type**: Document template type (protocol | system)
- **title**: Document title
- **description**: Brief description of the document purpose
- **location**: Relative path where to create the document (e.g., "protocols/New Protocol.md")
- Creates properly structured architectural documents
- Ensures consistency with established documentation standards

### arch_get_template
Get a document template for creating new architectural documents:
- **type**: Template type to retrieve (protocol | system)
- Returns template structure and formatting guidelines
- Provides standardized starting point for new documents
- Ensures consistency across architectural documentation

## Document Types and Organization

### Index Documents
- **Master Architecture Index**: Central navigation and system overview
- **Component Indexes**: Specialized indexes for different system areas
- **Cross-Reference Maps**: Visual representations of document relationships
- **Navigation Guides**: Structured pathways through architectural documentation

### Protocol Documents
- **System Protocols**: Core operational procedures and standards
- **Development Protocols**: Software development and engineering standards
- **Quality Assurance Protocols**: Testing, validation, and quality control procedures
- **Integration Protocols**: Standards for system integration and interoperability

### System Documents
- **Architecture Specifications**: Detailed system design and structure
- **Component Documentation**: Individual system component specifications
- **Interface Definitions**: API and interface specifications
- **Configuration Guides**: System setup and configuration documentation

## Intelligent Discovery Features

### Smart Search Algorithm
- **Semantic Matching**: Understanding of architectural concepts and relationships
- **Context Awareness**: Considers current work context for relevant suggestions
- **Fuzzy Matching**: Handles variations in terminology and phrasing
- **Relevance Ranking**: Prioritizes results based on multiple quality factors

### Cross-Reference Analysis
- **Dependency Mapping**: Identifies document dependencies and relationships
- **Impact Analysis**: Shows which documents are affected by changes
- **Reference Validation**: Ensures document links and references are valid
- **Consistency Checking**: Identifies potential inconsistencies between documents

### Template System
- **Structured Templates**: Standardized formats for different document types
- **Metadata Integration**: Automatic metadata generation and management
- **Consistency Enforcement**: Ensures adherence to documentation standards
- **Version Control**: Integration with version control for document tracking

## Workflow Integration

### Document Discovery Workflow
1. **arch_find_document** - Search for relevant architectural documents
2. **arch_cross_reference** - Understand document relationships
3. **arch_get_document** - Read detailed document content
4. **arch_list_architecture** - Browse complete document catalog

### Document Creation Workflow
1. **arch_get_template** - Get appropriate template for new document
2. **arch_create_from_template** - Create new document from template
3. **arch_cross_reference** - Establish relationships with existing documents
4. **arch_list_architecture** - Verify document integration

### Architecture Maintenance Workflow
1. **arch_list_architecture** - Review complete documentation structure
2. **arch_cross_reference** - Analyze document relationships and dependencies
3. **arch_find_document** - Locate documents needing updates
4. **arch_create_from_template** - Create new supporting documentation

## Use Cases

### System Understanding
- **New Team Member Onboarding**: Discover relevant architectural documentation
- **Component Research**: Find documentation for specific system components
- **Integration Planning**: Understand system interfaces and dependencies
- **Troubleshooting**: Locate relevant diagnostic and troubleshooting guides

### Documentation Management
- **Document Organization**: Maintain structured architectural documentation
- **Consistency Maintenance**: Ensure documentation follows established standards
- **Gap Identification**: Find areas lacking adequate documentation
- **Reference Management**: Maintain accurate cross-references between documents

### Development Support
- **Design Documentation**: Access architectural specifications and design decisions
- **Implementation Guidance**: Find protocols and standards for development work
- **Quality Assurance**: Access testing and validation documentation
- **Change Management**: Understand impact of proposed changes

## Quality Assurance Features

### Document Validation
- **Structure Validation**: Ensures documents follow established templates
- **Reference Validation**: Verifies all cross-references are valid and current
- **Metadata Validation**: Ensures proper document categorization and tagging
- **Content Validation**: Checks for completeness and consistency

### Consistency Maintenance
- **Standard Enforcement**: Ensures adherence to documentation standards
- **Cross-Reference Management**: Maintains accurate document relationships
- **Version Synchronization**: Keeps related documents synchronized
- **Quality Metrics**: Tracks documentation quality and completeness

## Benefits
- **Improved Discoverability**: Smart search makes architectural knowledge easily findable
- **Consistency Assurance**: Templates and validation ensure documentation quality
- **Relationship Clarity**: Cross-referencing reveals document connections and dependencies
- **Efficient Creation**: Templates accelerate new document creation
- **Knowledge Preservation**: Systematic organization preserves architectural knowledge
- **Team Collaboration**: Standardized documentation improves team communication

The Architecture server transforms architectural documentation from a collection of files into an intelligent, interconnected knowledge system that actively supports system understanding and development.
`;
        return {
          content: [{
            type: 'text',
            text: helpText
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
console.error('💡 Architectural document management and discovery tools ready - CORRECTED REGISTRY');
