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
const OBSIDIAN_VAULT_PATH = '/Users/bard/Code/claude-brain/data/BrainVault';
const ARCHITECTURE_FOLDER = path.join(OBSIDIAN_VAULT_PATH, 'Architecture');

// COMPREHENSIVE Architecture document registry - Updated 2026-01-14
// This serves as the "where is everything" reference for the AI assistant
const ARCHITECTURAL_DOCS = {
  // === INDEX DOCUMENTS ===
  'master-architecture-index': {
    path: 'Architecture/Master Architecture Index.md',
    title: 'Master Architecture Index',
    type: 'index',
    keywords: ['architecture', 'systems', 'overview', 'index', 'master', 'integration', 'ecosystem'],
    description: 'Central registry of all architectural systems with complete integration status'
  },
  'protocols-index': {
    path: 'protocols/Master Protocol Index.md',
    title: 'Master Protocol Index',
    type: 'protocols',
    keywords: ['protocols', 'operational', 'procedures', 'workflows', 'foundation'],
    description: 'Registry of all operational and system protocols with foundation protocol coverage'
  },

  // === SYSTEM LOCATION REFERENCES ===
  'system-paths': {
    path: null,  // Virtual document - content is hardcoded
    title: 'System Paths Reference',
    type: 'system',
    keywords: ['paths', 'locations', 'directories', 'files', 'where', 'find'],
    description: 'Critical file system locations for all major systems',
    content: `# System Paths Reference

## Project Root
- **All Projects**: /Users/bard/Code/

## Protocol System
- **Protocol MCP Server**: /Users/bard/Code/mcp-protocols/
- **Protocol Source Files**: /Users/bard/Code/mcp-protocols/src/protocols/foundation/
- **Protocol Registry**: /Users/bard/Code/mcp-protocols/src/registry.js
- **Access via MCP**: mikey_protocol_list, mikey_protocol_read <id>

## Brain System
- **Brain Manager**: /Users/bard/Code/mcp-brain-manager/
- **Brain Database**: /Users/bard/Code/Claude_Data/brain/brain.db
- **Brain Init V5**: /Users/bard/Code/claude-brain/brain_init_v5_working.js

## Architecture System
- **Architecture Server**: /Users/bard/Code/mcp-architecture/
- **This File**: /Users/bard/Code/mcp-architecture/src/index.js

## Documentation
- **Papers & Docs**: /Users/bard/Code/docs/papers/
- **Obsidian Vault**: /Users/bard/Documents/Obsidian/

## MCP Tools Directory
All MCP tools follow the pattern: /Users/bard/Code/mcp-<name>/
- mcp-protocols - Protocol system
- mcp-brain-manager - Brain/context management
- mcp-architecture - This architecture server
- mcp-continuation-notes - Session handoff
- mcp-protocol-engine - Protocol execution engine

## Configuration
- **Claude Desktop Config**: ~/.claude/claude_desktop_config.json
- **MCP Server Configs**: Within each mcp-* project
`
  },

  'mcp-tools-registry': {
    path: null,
    title: 'MCP Tools Registry',
    type: 'system',
    keywords: ['mcp', 'tools', 'servers', 'registry', 'list'],
    description: 'Complete list of all MCP tools and their purposes',
    content: `# MCP Tools Registry

## Core System Tools

### mikey-brain (mcp-brain-manager)
**Purpose**: Memory, state management, and project context
**Key Tools**:
- mikey_remember / mikey_recall - Persistent memory
- mikey_state_get / mikey_state_set - State management
- mikey_create_project - Create new projects (GRADUATED PROTOCOL)
- mikey_switch_project - Project context switching

### mikey-protocols (mcp-protocols)
**Purpose**: Protocol access and management
**Key Tools**:
- mikey_protocol_list - List all protocols
- mikey_protocol_read <id> - Read protocol content
- mikey_protocol_search <query> - Search protocols
- mikey_protocol_triggers <situation> - Find relevant protocols

### mcp-architecture (this server)
**Purpose**: System documentation and discovery
**Key Tools**:
- arch_find_document - Smart document search
- arch_list_architecture - List all docs
- arch_get_document - Read document content

### mcp-continuation-notes
**Purpose**: Session handoff between conversations
**Key Tools**:
- continuation_write - Write handoff note
- continuation_read_with_staleness - Read with freshness check
- continuation_check_handoff - Check for existing note

## Utility Tools

### filesystem-enhanced - File operations
### git - Git operations
### database - SQLite operations
### system - System commands
### random - Random generation
### smalledit - sed/awk editing

## Specialized Tools

### mikey-manager - Project workflow management
### protocol-engine - Protocol execution
### contemplation - Background processing
### vision - Screenshot/camera analysis
### elvis - Ollama delegation

## Tool Naming Convention
All custom tools use \`mikey_\` prefix to avoid collisions.
`
  },

  'protocol-system-guide': {
    path: null,
    title: 'Protocol System Guide',
    type: 'protocols',
    keywords: ['protocol', 'create', 'edit', 'add', 'new', 'modify'],
    description: 'How to work with the protocol system',
    content: `# Protocol System Guide

## Protocol Location
All protocols are stored in: /Users/bard/Code/mcp-protocols/src/protocols/foundation/

## Protocol Structure
Each protocol is a JavaScript module exporting:
- id: Unique identifier (kebab-case)
- name: Human-readable name
- version: Semantic version
- tier: 0-3 (0=meta, 1=critical, 2=foundation, 3=task-specific)
- purpose: One-line description
- triggers: Array of trigger conditions
- status: 'active' | 'draft' | 'deprecated'
- content: Full markdown content

## Adding a New Protocol
1. Create file: /Users/bard/Code/mcp-protocols/src/protocols/foundation/<id>.js
2. Export protocol object with all required fields
3. Add import to registry.js
4. Add to PROTOCOLS object in registry.js
5. Update MASTER_PROTOCOL_INDEX in registry.js
6. Restart mcp-protocols server (restart Claude Code)

## Accessing Protocols
- List all: mikey_protocol_list
- Read one: mikey_protocol_read <id>
- Search: mikey_protocol_search <query>
- Find by situation: mikey_protocol_triggers <situation>

## Current Protocols (17)
- protocol-selection (Tier 0)
- error-recovery (Tier 2)
- user-communication (Tier 2)
- task-approach (Tier 2)
- information-integration (Tier 2)
- progress-communication (Tier 2)
- naming-linter (Tier 2)
- active-inference (Tier 1)
- protocol-lifecycle (Tier 1)
- protocol-writing (Tier 1)
- architecture-update (Tier 1) - Keep docs synchronized with system changes
- protocol-graduation (Tier 1) - Convert text protocols to programmatic tools
- protocol-error-correction (Tier 1) - Fix protocols when they fail
- mcp-permissions (Tier 2) - Configure MCP tool auto-approval
- document-writing (Tier 2) - General writing workflow
- medium-article (Tier 3)
- create-project (Tier 3) - Points to mikey_create_project tool

## Graduated Protocols
Some protocols have "graduated" to tools. The protocol still exists
but points to a tool for execution. Example: create-project protocol
points to mikey_create_project tool.
`
  },

  'project-creation-guide': {
    path: null,
    title: 'Project Creation Guide',
    type: 'system',
    keywords: ['project', 'create', 'new', 'setup', 'github', 'repo'],
    description: 'How to create new projects using the system',
    content: `# Project Creation Guide

## Quick Start
Use the mikey_create_project tool:

mikey_create_project({
  projectName: "my-project",
  projectType: "mcp-tool",  // or: web-app, cli-tool, library, api, general
  description: "What it does",
  visibility: "public",     // or: private
  license: "MIT"            // or: Apache-2.0, GPL-3.0, ISC, None
})

## Prerequisites
1. Git installed: git --version
2. GitHub CLI: gh --version
3. GitHub auth: gh auth status
4. SSH keys recommended: ~/.ssh/id_ed25519.pub

## Project Location
All projects go in: /Users/bard/Code/<project-name>/

## What Gets Created
- Directory structure (src/, tests/, docs/)
- Git repository initialized
- GitHub remote created
- README.md, LICENSE, .gitignore
- CI/CD configuration
- Testing setup

## Protocol Reference
See: mikey_protocol_read create-project

## Tool Implementation
Source: /Users/bard/Code/mcp-brain-manager/src/index.ts
Look for: mikey_create_project
`
  },

  'architecture-server-docs': {
    path: 'Architecture/MCP Architecture Server Documentation.md',
    title: 'MCP Architecture Server Documentation',
    type: 'system',
    keywords: ['mcp', 'architecture', 'server', 'smart', 'discovery', 'templates', 'cross-reference'],
    description: 'Documentation for the intelligent architectural document management system'
  },

  'protocol-triggers': {
    path: null,
    title: 'Protocol Triggers Quick Reference',
    type: 'protocols',
    keywords: ['trigger', 'when', 'activate', 'use', 'which', 'protocol', 'select'],
    description: 'Quick reference for when to activate each protocol - like skill descriptions',
    content: `# Protocol Triggers Quick Reference

This document acts like skill descriptions - helping you know WHEN to use each protocol.

---

## Tier 0: Meta Protocol (Always First)

### protocol-selection
**Use when**: Starting ANY new task
**Triggers**:
- At the start of any new task
- When beginning work on a user request
- Before executing any significant action
- When context changes significantly

---

## Tier 1: Critical System Protocols

### active-inference
**Use when**: Reflecting on completed work
**Triggers**:
- After completing any non-trivial task
- When a task fails or produces unexpected results
- When user expresses surprise (positive or negative)
- When explicitly asked to reflect or improve
- After significant debugging sessions

### protocol-lifecycle
**Use when**: Managing protocols themselves
**Triggers**:
- When considering whether to create a new protocol
- When a protocol seems too complex for text execution
- When usage patterns suggest optimization
- Before major protocol system changes

### protocol-writing
**Use when**: Creating new protocols
**Triggers**:
- User requests a new protocol
- Identifying a repeating pattern that should be codified
- When workflow standardization would help
- After repeated similar tasks suggest a pattern

### architecture-update
**Use when**: System has been modified
**Triggers**:
- Created a new project or MCP tool
- Moved or relocated a system component
- Changed file paths or directory structure
- Added a new MCP server
- Deprecated or removed a system
- Changed how a system is accessed
- Modified protocol registry
- Updated system configuration paths
**Key principle**: Living documentation - stale docs cause future errors

### protocol-graduation
**Use when**: Converting protocol to tool
**Triggers**:
- Protocol is used frequently (weekly or more)
- Protocol execution is consistent with little variation
- Protocol has multiple steps prone to error
- User suggests a protocol should become a tool
- Reviewing protocol usage patterns
**Key principle**: Tools make execution deterministic - less uncertainty

### protocol-error-correction
**Use when**: A protocol failed or was wrong
**Triggers**:
- Protocol execution produced wrong result
- Protocol was missing a step
- Protocol had incorrect information
- User corrected AI behavior
- Discovered gap in existing protocol
**Key principle**: Fail once, fix permanently - update protocol immediately

---

## Tier 2: Foundation Operational Protocols

### mcp-permissions
**Use when**: Configuring MCP tool permissions
**Triggers**:
- Adding a new MCP server
- Tool requires frequent permission clicks
- Read-only tools should auto-approve
- Configuring Claude settings.local.json
- New tools added to existing server
**Key principle**: Read-only auto-approve, write tools require approval

### document-writing
**Use when**: Writing any substantial document
**Triggers**:
- User asks to write a document or paper
- Creating technical documentation
- Writing explanatory content
- Drafting any substantial text
- User says "write", "draft", "document"
**Key principle**: Ask destination and format BEFORE writing

### error-recovery
**Use when**: Something goes wrong
**Triggers**:
- Tool returns error, failure, or unexpected response
- File/path access fails (not found, permission denied)
- User request is unclear or has multiple interpretations
- Conflicting information from multiple sources
- Knowledge gaps impact response quality
- System limitations prevent standard approach

### user-communication
**Use when**: Interacting with the user
**Triggers**:
- Any direct user interaction or question
- User provides feedback (positive or negative)
- Need to explain something complex
- Delivering bad news or limitations
- Responding to emotional context

### task-approach
**Use when**: Figuring out what to do
**Triggers**:
- Any user request or question (before proceeding)
- User request is ambiguous or has multiple interpretations
- Task seems simple but might have hidden complexity
- User's stated request might differ from actual need
- Before making significant decisions

### information-integration
**Use when**: Combining multiple sources
**Triggers**:
- Request requires multiple sources (Brain + Obsidian + Web + Files)
- Conflicting information detected between sources
- Need comprehensive response from various data
- Reconciling old and new information
- Cross-referencing different systems

### progress-communication
**Use when**: Task is taking a while
**Triggers**:
- Task estimated to take >30 seconds of processing
- Multiple sequential tool calls required (>3 tool calls)
- Complex multi-step processes underway
- User might wonder what's happening
- Background work running

### naming-linter
**Use when**: Creating or modifying MCP tools
**Triggers**:
- Creating a new MCP server
- Adding new tools to an existing server
- Renaming tools or functions
- Before committing MCP tool changes
- Reviewing MCP tool PRs

---

## Tier 3: Task-Specific Protocols

### medium-article
**Use when**: Writing for Medium
**Triggers**:
- User wants to write a Medium article
- User mentions publishing to Medium
- Creating content for blog/publication
- Need Medium-compatible formatting

### create-project (GRADUATED TO TOOL)
**Use when**: Setting up a new codebase
**Triggers**:
- User says "create a new project"
- User says "set up a new repo"
- User says "start a new project"
- User wants to scaffold a new application
**Implementation**: Use mikey_create_project tool instead of manual steps

---

## Quick Decision Tree

\`\`\`
Is this the start of a task?
  YES → protocol-selection

Did something fail/error?
  YES → error-recovery

Am I interacting with the user?
  YES → user-communication

Is the request unclear?
  YES → task-approach

Do I need multiple sources?
  YES → information-integration

Is this taking a while?
  YES → progress-communication

Am I creating/modifying MCP tools?
  YES → naming-linter

Did I just finish a significant task?
  YES → active-inference

Am I creating a new protocol?
  YES → protocol-writing

Am I writing for Medium?
  YES → medium-article

Am I creating a new project?
  YES → use mikey_create_project tool

Did I just create/move/modify a system?
  YES → architecture-update

Did a protocol fail or produce wrong results?
  YES → protocol-error-correction

Am I adding an MCP server or configuring permissions?
  YES → mcp-permissions

Am I writing a document/paper?
  YES → document-writing (ask destination first!)
\`\`\`

---

## Access Commands

- List all protocols: \`mikey_protocol_list\`
- Read specific protocol: \`mikey_protocol_read <id>\`
- Find by situation: \`mikey_protocol_triggers "<description>"\`
- Search protocols: \`mikey_protocol_search "<query>"\`
`
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
              output += `📍 **Location**: Virtual (hardcoded in architecture server)\n`;
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
