#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ShieldSecurityTester } from './security-tests.js';
import { checkKaliHealth } from './kali-client.js';
let tester = null;
const tools = [
    {
        name: 'health_check',
        description: 'Check if Kali Linux container is running',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'init_tester',
        description: 'Initialize security tester for local or live environment',
        inputSchema: {
            type: 'object',
            properties: {
                base_url: {
                    type: 'string',
                    description: 'http://localhost:5000 or https://shield.live'
                },
                environment: {
                    type: 'string',
                    enum: ['local', 'live'],
                    description: 'Test environment'
                },
                api_key: {
                    type: 'string',
                    description: 'Required for live testing'
                }
            },
            required: ['base_url', 'environment']
        }
    },
    {
        name: 'test_sql_injection',
        description: 'Test endpoint for SQL injection vulnerabilities',
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string',
                    description: '/api/users or /api/shield'
                },
                param: {
                    type: 'string',
                    description: 'Parameter to test (default: id)'
                }
            },
            required: ['endpoint']
        }
    },
    {
        name: 'test_xss',
        description: 'Test for XSS vulnerabilities',
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string',
                    description: 'API endpoint to test'
                },
                param: {
                    type: 'string',
                    description: 'Parameter name (default: search)'
                }
            },
            required: ['endpoint']
        }
    },
    {
        name: 'test_auth_bypass',
        description: 'Test authentication bypass vulnerabilities',
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string',
                    description: '/api/auth/login'
                },
                username: {
                    type: 'string'
                },
                password: {
                    type: 'string'
                }
            },
            required: ['endpoint', 'username', 'password']
        }
    },
    {
        name: 'test_idor',
        description: 'Test Insecure Direct Object Reference',
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string',
                    description: '/api/users/profile'
                },
                id_param: {
                    type: 'string',
                    description: 'ID parameter name (default: id)'
                }
            },
            required: ['endpoint']
        }
    },
    {
        name: 'test_rate_limiting',
        description: 'Test rate limiting protection',
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string'
                },
                attempts: {
                    type: 'number',
                    description: 'Number of requests (default: 50)'
                }
            },
            required: ['endpoint']
        }
    },
    {
        name: 'test_cors',
        description: 'Test CORS configuration',
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string'
                }
            },
            required: ['endpoint']
        }
    },
    {
        name: 'test_security_headers',
        description: 'Test security headers',
        inputSchema: {
            type: 'object',
            properties: {
                endpoint: {
                    type: 'string'
                }
            },
            required: ['endpoint']
        }
    },
    {
        name: 'test_owasp',
        description: 'Run OWASP Top 10 scan',
        inputSchema: {
            type: 'object',
            properties: {
                domain: {
                    type: 'string'
                }
            },
            required: ['domain']
        }
    },
    {
        name: 'test_dependencies',
        description: 'Scan dependencies for vulnerabilities',
        inputSchema: {
            type: 'object',
            properties: {
                project_path: {
                    type: 'string'
                }
            },
            required: ['project_path']
        }
    },
    {
        name: 'run_full_scan',
        description: 'Run comprehensive security scan',
        inputSchema: {
            type: 'object',
            properties: {
                endpoints: {
                    type: 'array',
                    items: { type: 'string' }
                }
            },
            required: ['endpoints']
        }
    }
];
const server = new Server({
    name: 'kali-shield-testing',
    version: '1.0.0'
}, {
    capabilities: {
        tools: {}
    }
});
server.setRequestHandler({ method: 'tools/list' }, async () => ({
    tools
}));
server.setRequestHandler({ method: 'tools/call' }, async (request) => {
    try {
        let result;
        const args = (request.params?.arguments || {});
        switch (request.params?.name) {
            case 'health_check': {
                const isHealthy = await checkKaliHealth();
                result = {
                    status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
                    message: isHealthy ? 'Kali container is running' : 'Kali container not found'
                };
                break;
            }
            case 'init_tester': {
                const baseUrl = args.base_url;
                const environment = args.environment;
                const apiKey = args.api_key;
                if (environment === 'live' && !apiKey) {
                    throw new Error('API key required for live testing');
                }
                tester = new ShieldSecurityTester(baseUrl, environment, apiKey);
                result = { message: `✅ Tester initialized for ${environment}`, target: baseUrl };
                break;
            }
            case 'test_sql_injection': {
                if (!tester)
                    throw new Error('Tester not initialized');
                const endpoint = args.endpoint;
                const param = args.param || 'id';
                result = await tester.testSqlInjection(endpoint, param);
                break;
            }
            case 'test_xss': {
                if (!tester)
                    throw new Error('Tester not initialized');
                const endpoint = args.endpoint;
                const param = args.param || 'search';
                result = await tester.testXSS(endpoint, param);
                break;
            }
            case 'test_auth_bypass': {
                if (!tester)
                    throw new Error('Tester not initialized');
                result = await tester.testAuthBypass(args.endpoint, {
                    username: args.username,
                    password: args.password
                });
                break;
            }
            case 'test_idor': {
                if (!tester)
                    throw new Error('Tester not initialized');
                const endpoint = args.endpoint;
                const idParam = args.id_param || 'id';
                result = await tester.testIDOR(endpoint, idParam);
                break;
            }
            case 'test_rate_limiting': {
                if (!tester)
                    throw new Error('Tester not initialized');
                const endpoint = args.endpoint;
                const attempts = args.attempts || 50;
                result = await tester.testRateLimiting(endpoint, attempts);
                break;
            }
            case 'test_cors': {
                if (!tester)
                    throw new Error('Tester not initialized');
                result = await tester.testCORS(args.endpoint);
                break;
            }
            case 'test_security_headers': {
                if (!tester)
                    throw new Error('Tester not initialized');
                result = await tester.testSecurityHeaders(args.endpoint);
                break;
            }
            case 'test_owasp': {
                if (!tester)
                    throw new Error('Tester not initialized');
                result = await tester.testOwasp(args.domain);
                break;
            }
            case 'test_dependencies': {
                if (!tester)
                    throw new Error('Tester not initialized');
                result = await tester.testDependencies(args.project_path);
                break;
            }
            case 'run_full_scan': {
                if (!tester)
                    throw new Error('Tester not initialized');
                result = await tester.runFullScan(args.endpoints);
                break;
            }
            default:
                throw new Error(`Unknown tool: ${request.params?.name}`);
        }
        return {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: 'text', text: `❌ Error: ${msg}` }],
            isError: true
        };
    }
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🔐 Kali Shield Testing MCP server started');
//# sourceMappingURL=index.js.map