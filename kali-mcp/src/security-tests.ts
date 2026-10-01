import { executeInKali } from './kali-client.js';

export interface TestResult {
  tool: string;
  target: string;
  timestamp: string;
  status: 'VULNERABLE' | 'SAFE' | 'WARNING' | 'ERROR';
  details: string;
  recommendations?: string[];
}

export class ShieldSecurityTester {
  private environment: 'local' | 'live' = 'local';
  private baseUrl: string = '';
  private apiKey?: string;

  constructor(baseUrl: string, environment: 'local' | 'live' = 'local', apiKey?: string) {
    if (!baseUrl) throw new Error('Base URL is required');
    if (environment === 'live' && !apiKey) {
      throw new Error('API key required for live testing');
    }

    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.environment = environment;
    this.apiKey = apiKey;
  }

  // Network Reconnaissance
  async runNetworkScan(target: string): Promise<TestResult> {
    const command = `nmap -sV -sC -O -A --script vuln ${target} 2>&1 | head -100`;
    const output = await executeInKali(command);

    return {
      tool: 'Nmap',
      target,
      timestamp: new Date().toISOString(),
      status: output.includes('open') ? 'WARNING' : 'SAFE',
      details: output,
      recommendations: output.includes('open') ? [
        'Review open ports and running services',
        'Disable unnecessary services',
        'Implement firewall rules'
      ] : undefined
    };
  }

  // SQL Injection Testing
  async testSqlInjection(endpoint: string, param: string): Promise<TestResult> {
    const url = `${this.baseUrl}${endpoint}`;
    const command = `sqlmap -u "${url}" -p ${param} --batch --risk=2 --level=3 2>&1 | head -200`;
    const output = await executeInKali(command);

    const isVulnerable = output.toLowerCase().includes('vulnerable') || output.toLowerCase().includes('injectable');

    return {
      tool: 'SQLMap',
      target: endpoint,
      timestamp: new Date().toISOString(),
      status: isVulnerable ? 'VULNERABLE' : 'SAFE',
      details: output,
      recommendations: isVulnerable ? [
        'Use parameterized queries/prepared statements',
        'Implement input validation and sanitization',
        'Use ORM with proper escaping (Entity Framework)',
        'Apply principle of least privilege to DB accounts'
      ] : undefined
    };
  }

  // XSS Testing
  async testXSS(endpoint: string, param: string): Promise<TestResult> {
    const payloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      "'; alert('XSS'); //",
      '<img src=x onerror="alert(\'XSS\')">'
    ];

    const results: string[] = [];
    for (const payload of payloads) {
      const encoded = encodeURIComponent(payload);
      const url = `${this.baseUrl}${endpoint}?${param}=${encoded}`;
      const command = `curl -s "${url}" 2>/dev/null | grep -i "${payload.substring(0, 10)}" || echo "not-found"`;
      const output = await executeInKali(command);
      if (!output.includes('not-found')) results.push(payload);
    }

    return {
      tool: 'XSS Payloads',
      target: endpoint,
      timestamp: new Date().toISOString(),
      status: results.length > 0 ? 'VULNERABLE' : 'SAFE',
      details: results.length > 0 ? `Found ${results.length} XSS payloads: ${results.slice(0, 2).join(', ')}` : 'No XSS found',
      recommendations: results.length > 0 ? [
        'Sanitize all user input',
        'Implement Content Security Policy (CSP) headers',
        'Use framework auto-escaping (Vue 3 does this by default)',
        'Encode output properly in templates'
      ] : undefined
    };
  }

  // Authentication Testing
  async testAuthBypass(loginEndpoint: string, credentials: { username: string; password: string }): Promise<TestResult> {
    const payloads = [
      { u: "admin' OR '1'='1", p: "anything" },
      { u: "admin' --", p: "" },
      { u: "' OR 1=1 --", p: "" },
      { u: credentials.username, p: credentials.password }
    ];

    const results: string[] = [];
    for (const payload of payloads) {
      const command = `curl -s -X POST "${this.baseUrl}${loginEndpoint}" \\
        -d "username=${encodeURIComponent(payload.u)}&password=${encodeURIComponent(payload.p)}" \\
        -H "Content-Type: application/x-www-form-urlencoded" 2>/dev/null | head -50`;

      const output = await executeInKali(command);
      if (output.toLowerCase().includes('success') || output.toLowerCase().includes('token') || output.includes('200')) {
        results.push(JSON.stringify(payload));
      }
    }

    return {
      tool: 'Auth Bypass',
      target: loginEndpoint,
      timestamp: new Date().toISOString(),
      status: results.length > 1 ? 'VULNERABLE' : 'SAFE',
      details: results.length > 0 ? `Bypass attempts: ${results.length}` : 'No bypass found',
      recommendations: results.length > 0 ? [
        'Implement rate limiting on login endpoint',
        'Use strong input validation and parameterized queries',
        'Log all authentication attempts',
        'Implement account lockout after failed attempts'
      ] : undefined
    };
  }

  // OWASP Top 10 Testing
  async testOwasp(domain: string): Promise<TestResult> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    const command = `nikto -h ${cleanDomain} -p 80 -o /tmp/nikto-report.txt -nossl 2>&1 && cat /tmp/nikto-report.txt | head -100`;
    const output = await executeInKali(command);

    const vulnerabilities = (output.match(/OSVDB|Potentially problematic/g) || []).length;

    return {
      tool: 'Nikto (OWASP)',
      target: domain,
      timestamp: new Date().toISOString(),
      status: vulnerabilities > 0 ? 'WARNING' : 'SAFE',
      details: output,
      recommendations: vulnerabilities > 0 ? [
        'Address OWASP Top 10 findings immediately',
        'Implement Web Application Firewall (WAF)',
        'Run regular security audits',
        'Keep dependencies updated'
      ] : undefined
    };
  }

  // IDOR Testing (Insecure Direct Object Reference)
  async testIDOR(endpoint: string, idParam: string = 'id'): Promise<TestResult> {
    const ids = ['1', '2', '3', 'admin', '../admin'];
    const found: string[] = [];

    for (const id of ids) {
      const url = `${this.baseUrl}${endpoint}?${idParam}=${id}`;
      const command = `curl -s -o /dev/null -w "%{http_code}" "${url}" 2>/dev/null`;
      const status = await executeInKali(command);

      if (status.trim() === '200') found.push(id);
    }

    return {
      tool: 'IDOR Test',
      target: endpoint,
      timestamp: new Date().toISOString(),
      status: found.length > 2 ? 'VULNERABLE' : 'SAFE',
      details: found.length > 0 ? `Accessible without permission: ${found.join(', ')}` : 'IDOR protection OK',
      recommendations: found.length > 2 ? [
        'Implement proper authorization checks per object',
        'Validate user ownership before returning data',
        'Use UUIDs instead of sequential IDs',
        'Log unauthorized access attempts'
      ] : undefined
    };
  }

  // Rate Limiting & Brute Force
  async testRateLimiting(endpoint: string, attempts: number = 50): Promise<TestResult> {
    const command = `for i in $(seq 1 ${attempts}); do curl -s -o /dev/null -w "%{http_code}\\n" "${this.baseUrl}${endpoint}" 2>/dev/null; done | sort | uniq -c`;
    const output = await executeInKali(command);

    const hasRateLimit = output.includes('429') || output.includes('403');

    return {
      tool: 'Rate Limiting',
      target: endpoint,
      timestamp: new Date().toISOString(),
      status: hasRateLimit ? 'SAFE' : 'WARNING',
      details: output,
      recommendations: !hasRateLimit ? [
        'Implement rate limiting (recommend 100 req/min per IP)',
        'Add CAPTCHA for repeated failed attempts',
        'Block/throttle suspicious IPs',
        'Use tools like nginx rate limiting or CloudFlare'
      ] : undefined
    };
  }

  // CORS Testing
  async testCORS(endpoint: string): Promise<TestResult> {
    const command = `curl -s -I -H "Origin: http://attacker.com" "${this.baseUrl}${endpoint}" 2>/dev/null | grep -i "Access-Control"`;
    const output = await executeInKali(command);

    const hasWildcard = output.includes('*');
    const hasAllowOrigin = output.includes('Access-Control-Allow-Origin');

    return {
      tool: 'CORS Test',
      target: endpoint,
      timestamp: new Date().toISOString(),
      status: hasWildcard ? 'VULNERABLE' : hasAllowOrigin ? 'WARNING' : 'SAFE',
      details: output || 'No CORS headers found',
      recommendations: hasWildcard ? [
        'Replace * with specific allowed origins',
        'Implement server-side origin validation',
        'Never use * for credentialed requests'
      ] : hasAllowOrigin ? [
        'Verify allowed origins are necessary',
        'Use whitelist instead of wildcard'
      ] : undefined
    };
  }

  // Security Headers Testing
  async testSecurityHeaders(endpoint: string): Promise<TestResult> {
    const command = `curl -s -I "${this.baseUrl}${endpoint}" 2>/dev/null | grep -i "X-Frame\\|X-Content\\|Strict-Transport\\|Content-Security"`;
    const output = await executeInKali(command);

    const hasSecurityHeaders = output.split('\n').filter(l => l.trim()).length > 0;

    return {
      tool: 'Security Headers',
      target: endpoint,
      timestamp: new Date().toISOString(),
      status: hasSecurityHeaders ? 'SAFE' : 'WARNING',
      details: output || 'Missing security headers',
      recommendations: !hasSecurityHeaders ? [
        'Add X-Frame-Options: DENY',
        'Add X-Content-Type-Options: nosniff',
        'Add Strict-Transport-Security header',
        'Add Content-Security-Policy header',
        'Add X-XSS-Protection header'
      ] : undefined
    };
  }

  // Dependency Vulnerability Scan
  async testDependencies(projectPath: string): Promise<TestResult> {
    const command = `cd ${projectPath} && (npm audit --json 2>/dev/null || echo '{}') | head -200`;
    const output = await executeInKali(command);

    const hasVulnerabilities = output.toLowerCase().includes('vulnerable') || output.toLowerCase().includes('critical');

    return {
      tool: 'Dependency Scan',
      target: projectPath,
      timestamp: new Date().toISOString(),
      status: hasVulnerabilities ? 'WARNING' : 'SAFE',
      details: output.substring(0, 500) + (output.length > 500 ? '...' : ''),
      recommendations: hasVulnerabilities ? [
        'Run npm audit fix to auto-patch',
        'Review and update dependencies regularly',
        'Use Snyk or npm audit in CI/CD pipeline'
      ] : undefined
    };
  }

  // Full Scan
  async runFullScan(endpoints: string[]): Promise<TestResult[]> {
    console.log(`\n🔍 Starting full security scan on ${this.environment} environment...`);
    console.log(`📍 Target: ${this.baseUrl}\n`);

    const results: TestResult[] = [];

    try {
      // Network scan
      const domain = this.baseUrl.replace(/^https?:\/\//, '').split('/')[0];
      results.push(await this.runNetworkScan(domain));
    } catch (e) {
      console.error('Network scan error:', e);
    }

    // Per endpoint tests
    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint}...`);

      try {
        results.push(await this.testSqlInjection(endpoint, 'id'));
      } catch (e) {
        console.error(`SQL injection test failed for ${endpoint}:`, e);
      }

      try {
        results.push(await this.testXSS(endpoint, 'search'));
      } catch (e) {
        console.error(`XSS test failed for ${endpoint}:`, e);
      }

      try {
        results.push(await this.testIDOR(endpoint));
      } catch (e) {
        console.error(`IDOR test failed for ${endpoint}:`, e);
      }

      try {
        results.push(await this.testRateLimiting(endpoint, 30));
      } catch (e) {
        console.error(`Rate limiting test failed for ${endpoint}:`, e);
      }

      try {
        results.push(await this.testCORS(endpoint));
      } catch (e) {
        console.error(`CORS test failed for ${endpoint}:`, e);
      }
    }

    // Global tests
    try {
      results.push(await this.testOwasp(this.baseUrl));
    } catch (e) {
      console.error('OWASP test error:', e);
    }

    try {
      results.push(await this.testSecurityHeaders(this.baseUrl));
    } catch (e) {
      console.error('Security headers test error:', e);
    }

    return results;
  }
}
